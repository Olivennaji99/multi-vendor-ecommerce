import bcrypt from "bcryptjs";

import { CustomerProfile } from "../models/CustomerProfile.model";
import { User, type IUser } from "../models/User.model";
import { ConflictError, UnauthorizedError, ValidationError } from "../lib/errors";
import { loginSchema, type RegisterCustomerInput } from "../schemas/auth.schema";
import type { Role } from "../types/enums";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
}

function toAuthenticatedUser(user: IUser): AuthenticatedUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<AuthenticatedUser | null> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) return null;

  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user || !user.isActive) return null;

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) return null;

  user.lastLoginAt = new Date();
  await user.save();

  return toAuthenticatedUser(user);
}

export async function changePassword(
  actor: { id: string },
  input: { currentPassword: string; newPassword: string }
): Promise<void> {
  const user = await User.findById(actor.id);
  if (!user) throw new UnauthorizedError();

  const valid = await bcrypt.compare(input.currentPassword, user.password);
  if (!valid) throw new ValidationError("Current password is incorrect");

  user.password = await hashPassword(input.newPassword);
  user.mustChangePassword = false;
  await user.save();
}

export async function getAuthenticatedUserById(id: string): Promise<AuthenticatedUser | null> {
  const user = await User.findById(id);
  if (!user || !user.isActive) return null;
  return toAuthenticatedUser(user);
}

export async function registerCustomer(
  input: Omit<RegisterCustomerInput, "confirmPassword">
): Promise<AuthenticatedUser> {
  const email = input.email.toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError("A user with this email already exists");

  const user = await User.create({
    name: input.name,
    email,
    password: await hashPassword(input.password),
    role: "CUSTOMER",
  });

  await CustomerProfile.create({ user: user._id, addresses: [] });

  return toAuthenticatedUser(user);
}
