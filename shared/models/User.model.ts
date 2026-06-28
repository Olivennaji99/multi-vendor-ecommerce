import mongoose, { Schema, type Document, type Model } from "mongoose";

import { ROLES, type Role } from "../types/enums";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  mustChangePassword: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, index: true },
    mustChangePassword: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    avatarUrl: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        Reflect.deleteProperty(ret, "password");
        return ret;
      },
    },
  }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
