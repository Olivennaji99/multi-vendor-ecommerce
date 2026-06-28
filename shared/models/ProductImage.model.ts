import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IProductImage extends Document {
  product: Types.ObjectId;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    url: { type: String, required: true },
    altText: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductImage: Model<IProductImage> =
  mongoose.models.ProductImage || mongoose.model<IProductImage>("ProductImage", productImageSchema);
