import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IProduct extends Document {
  seller: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  images: Types.ObjectId[];
  discount: Types.ObjectId | null;
  tags: string[];
  brand: string;
  isFeatured: boolean;
  isTrending: boolean;
  isRecommended: boolean;
  isFlashSale: boolean;
  ratingAverage: number;
  ratingCount: number;
  viewCount: number;
  isActive: boolean;
  createdByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, trim: true },
    images: [{ type: Schema.Types.ObjectId, ref: "ProductImage" }],
    discount: { type: Schema.Types.ObjectId, ref: "Discount", default: null },
    tags: { type: [String], default: [] },
    brand: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isTrending: 1, isActive: 1 });
productSchema.index({ isRecommended: 1, isActive: 1 });
productSchema.index({ isFlashSale: 1, isActive: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
