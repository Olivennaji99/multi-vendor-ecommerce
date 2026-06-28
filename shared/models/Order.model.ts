import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

import { ORDER_STATUSES, type OrderStatus } from "../types/enums";

export interface IShippingAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  customer: Types.ObjectId;
  orderNumber: string;
  items: Types.ObjectId[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  payment: Types.ObjectId | null;
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [{ type: Schema.Types.ObjectId, ref: "OrderItem" }],
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "PENDING", index: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
    placedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
