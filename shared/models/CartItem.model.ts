import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface ICartItem extends Document {
  cart: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  priceSnapshot: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    cart: { type: Schema.Types.ObjectId, ref: "Cart", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true },
  },
  { timestamps: true }
);

cartItemSchema.index({ cart: 1, product: 1 }, { unique: true });

export const CartItem: Model<ICartItem> =
  mongoose.models.CartItem || mongoose.model<ICartItem>("CartItem", cartItemSchema);
