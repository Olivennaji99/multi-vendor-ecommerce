import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IOrderItem extends Document {
  order: Types.ObjectId;
  product: Types.ObjectId;
  seller: Types.ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  discountAppliedSnapshot: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    discountAppliedSnapshot: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const OrderItem: Model<IOrderItem> =
  mongoose.models.OrderItem || mongoose.model<IOrderItem>("OrderItem", orderItemSchema);
