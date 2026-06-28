import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface ICart extends Document {
  customer: Types.ObjectId;
  items: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [{ type: Schema.Types.ObjectId, ref: "CartItem" }],
  },
  { timestamps: true }
);

export const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);
