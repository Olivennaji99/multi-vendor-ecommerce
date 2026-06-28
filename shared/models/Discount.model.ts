import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

import {
  DISCOUNT_APPLIES_TO,
  DISCOUNT_TYPES,
  type DiscountAppliesTo,
  type DiscountType,
} from "../types/enums";

export interface IDiscount extends Document {
  name: string;
  type: DiscountType;
  value: number;
  appliesTo: DiscountAppliesTo;
  products: Types.ObjectId[];
  categories: Types.ObjectId[];
  startsAt: Date;
  endsAt: Date;
  isFlashSale: boolean;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: DISCOUNT_TYPES, required: true },
    value: { type: Number, required: true, min: 0 },
    appliesTo: { type: String, enum: DISCOUNT_APPLIES_TO, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isFlashSale: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Discount: Model<IDiscount> =
  mongoose.models.Discount || mongoose.model<IDiscount>("Discount", discountSchema);
