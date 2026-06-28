import { User } from "../models/User.model";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { buildPaginatedResult, getSkip } from "../lib/pagination";
import type { UpdateUserInput } from "../schemas/user.schema";
import type { Actor } from "../types/actor";

export async function listUsers(
  actor: Actor,
  params: { page: number; limit: number; role?: string; search?: string }
) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const filter: Record<string, unknown> = {};
  if (params.role) filter.role = params.role;
  if (params.search) {
    filter.$or = [
      { name: new RegExp(params.search, "i") },
      { email: new RegExp(params.search, "i") },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(getSkip(params.page, params.limit))
      .limit(params.limit),
    User.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, params.page, params.limit);
}

export async function setUserActive(actor: Actor, userId: string, isActive: boolean) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  user.isActive = isActive;
  await user.save();
  return user;
}

export async function updateOwnProfile(actor: Actor, input: UpdateUserInput) {
  const user = await User.findById(actor.id);
  if (!user) throw new NotFoundError("User not found");

  if (input.name !== undefined) user.name = input.name;
  if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;
  await user.save();
  return user;
}

export async function getRecentUsers(limit: number) {
  return User.find({ role: "CUSTOMER" }).sort({ createdAt: -1 }).limit(limit);
}

export async function getPlatformUserCounts() {
  const [totalUsers, totalSellers, totalCustomers] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "SELLER" }),
    User.countDocuments({ role: "CUSTOMER" }),
  ]);
  return { totalUsers, totalSellers, totalCustomers };
}
