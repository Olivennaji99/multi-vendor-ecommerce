import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IBankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface ISellerProfile extends Document {
  user: Types.ObjectId;
  storeName: string;
  assignedCategories: Types.ObjectId[];
  bio: string;
  phone: string;
  bankDetails: IBankDetails | null;
  totalRevenue: number;
  createdByAdmin: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bankDetailsSchema = new Schema<IBankDetails>(
  {
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
  },
  { _id: false }
);

const sellerProfileSchema = new Schema<ISellerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    storeName: { type: String, required: true, trim: true },
    assignedCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    bankDetails: { type: bankDetailsSchema, default: null },
    totalRevenue: { type: Number, default: 0 },
    createdByAdmin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const SellerProfile: Model<ISellerProfile> =
  mongoose.models.SellerProfile ||
  mongoose.model<ISellerProfile>("SellerProfile", sellerProfileSchema);
