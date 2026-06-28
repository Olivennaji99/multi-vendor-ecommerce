import type { ICategory } from "../models/Category.model";
import type { IDiscount } from "../models/Discount.model";
import type { IProductImage } from "../models/ProductImage.model";
import { computeDiscountedPrice, computeDiscountPercentage } from "../services/discount.service";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  brand: string;
  imageUrl: string;
  imageAlt: string;
  category: { name: string; slug: string } | null;
  price: number;
  discountedPrice: number;
  discountPercentage: number;
  ratingAverage: number;
  ratingCount: number;
  stock: number;
}

interface PopulatedProductLike {
  _id: { toString(): string };
  name: string;
  slug: string;
  brand: string;
  price: number;
  ratingAverage: number;
  ratingCount: number;
  stock: number;
  images: unknown;
  discount: unknown;
  category: unknown;
}

export function toProductCardData(product: PopulatedProductLike): ProductCardData {
  const discount = product.discount as IDiscount | null;
  const discountedPrice = computeDiscountedPrice(product.price, discount);
  const discountPercentage = computeDiscountPercentage(product.price, discountedPrice);

  const images = (product.images as IProductImage[]) ?? [];
  const primaryImage = images.find((image) => image.isPrimary) ?? images[0];

  const category = product.category as ICategory | null;

  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    imageUrl: primaryImage?.url ?? "/placeholder-product.svg",
    imageAlt: primaryImage?.altText || product.name,
    category: category ? { name: category.name, slug: category.slug } : null,
    price: product.price,
    discountedPrice,
    discountPercentage,
    ratingAverage: product.ratingAverage,
    ratingCount: product.ratingCount,
    stock: product.stock,
  };
}
