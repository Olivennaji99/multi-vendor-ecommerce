import { Category } from "../models/Category.model";
import { SellerProfile } from "../models/SellerProfile.model";
import { User } from "../models/User.model";
import { ConflictError, ForbiddenError, NotFoundError } from "../lib/errors";
import { buildPaginatedResult, getSkip } from "../lib/pagination";
import type { CreateSellerInput, UpdateSellerInput } from "../schemas/seller.schema";
import type { Actor } from "../types/actor";
import { writeAuditLog } from "./audit.service";
import { hashPassword } from "./auth.service";
import { createNotification } from "./notification.service";

export function buildDefaultSellerPassword(firstName: string, lastName: string): string {
  return `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, "");
}

export async function createSeller(actor: Actor, input: CreateSellerInput) {
  if (actor.role !== "ADMIN") throw new ForbiddenError("Only an admin can create seller accounts");

  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new ConflictError("A user with this email already exists");

  const categories = await Category.find({ _id: { $in: input.categories } });
  if (categories.length !== input.categories.length) {
    throw new NotFoundError("One or more selected categories could not be found");
  }

  const defaultPassword = buildDefaultSellerPassword(input.firstName, input.lastName);
  const hashedPassword = await hashPassword(defaultPassword);

  const user = await User.create({
    name: `${input.firstName} ${input.lastName}`,
    email: input.email.toLowerCase(),
    password: hashedPassword,
    role: "SELLER",
    mustChangePassword: true,
  });

  const profile = await SellerProfile.create({
    user: user._id,
    storeName: input.storeName,
    assignedCategories: input.categories,
    bio: input.bio ?? "",
    phone: input.phone,
    createdByAdmin: actor.id,
  });

  await createNotification({
    user: user._id.toString(),
    type: "NEW_SELLER_CREATED",
    title: "Welcome to the platform",
    message: `Your seller account for ${input.storeName} has been created. Please change your password after logging in.`,
  });

  await writeAuditLog({
    actor: actor.id,
    action: "SELLER_CREATED",
    entityType: "User",
    entityId: user._id.toString(),
    meta: { storeName: input.storeName },
  });

  return { user, profile, defaultPassword };
}

export async function updateSeller(actor: Actor, sellerId: string, input: UpdateSellerInput) {
  if (actor.role !== "ADMIN" && actor.id !== sellerId) throw new ForbiddenError();

  const profile = await SellerProfile.findOne({ user: sellerId });
  if (!profile) throw new NotFoundError("Seller not found");

  if (input.storeName !== undefined) profile.storeName = input.storeName;
  if (input.bio !== undefined) profile.bio = input.bio;
  if (input.phone !== undefined) profile.phone = input.phone;
  if (input.assignedCategories !== undefined && actor.role === "ADMIN") {
    profile.assignedCategories = input.assignedCategories.map((id) => id as never);
  }
  await profile.save();

  if (input.isActive !== undefined && actor.role === "ADMIN") {
    await User.findByIdAndUpdate(sellerId, { isActive: input.isActive });
    await writeAuditLog({
      actor: actor.id,
      action: input.isActive ? "USER_REACTIVATED" : "USER_DEACTIVATED",
      entityType: "User",
      entityId: sellerId,
    });
  }

  return profile;
}

export async function getSellerProfile(sellerId: string) {
  const profile = await SellerProfile.findOne({ user: sellerId })
    .populate("assignedCategories")
    .populate("user");
  if (!profile) throw new NotFoundError("Seller not found");
  return profile;
}

export async function listSellers(
  actor: Actor,
  params: { page: number; limit: number; search?: string }
) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const userFilter: Record<string, unknown> = { role: "SELLER" };
  if (params.search) {
    userFilter.$or = [
      { name: new RegExp(params.search, "i") },
      { email: new RegExp(params.search, "i") },
    ];
  }

  const sellerUsers = await User.find(userFilter).select("_id");
  const sellerIds = sellerUsers.map((u) => u._id);

  const [items, total] = await Promise.all([
    SellerProfile.find({ user: { $in: sellerIds } })
      .populate("user")
      .populate("assignedCategories")
      .sort({ createdAt: -1 })
      .skip(getSkip(params.page, params.limit))
      .limit(params.limit),
    SellerProfile.countDocuments({ user: { $in: sellerIds } }),
  ]);

  return buildPaginatedResult(items, total, params.page, params.limit);
}

export async function getTopSellers(limit: number) {
  return SellerProfile.find({}).populate("user").sort({ totalRevenue: -1 }).limit(limit);
}

export async function assertSellerOwnsCategory(sellerId: string, categoryId: string) {
  const profile = await SellerProfile.findOne({ user: sellerId });
  if (!profile) throw new NotFoundError("Seller profile not found");

  const allowed = profile.assignedCategories.some((c) => c.toString() === categoryId);
  if (!allowed) {
    throw new ForbiddenError("You are not assigned to this category");
  }
}
