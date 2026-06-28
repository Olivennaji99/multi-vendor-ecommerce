import { Category } from "../models/Category.model";
import { Discount } from "../models/Discount.model";
import { Product, type IProduct } from "../models/Product.model";
import { ProductImage } from "../models/ProductImage.model";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { buildPaginatedResult, getSkip } from "../lib/pagination";
import { slugify } from "../lib/slugify";
import type { CreateProductInput, ProductFilterInput, UpdateProductInput } from "../schemas/product.schema";
import type { Actor } from "../types/actor";
import { LOW_STOCK_THRESHOLD } from "../constants";
import { writeAuditLog } from "./audit.service";
import { createNotification } from "./notification.service";
import { assertSellerOwnsCategory } from "./seller.service";
import { createProductPriceDiscount } from "./discount.service";

async function resolveUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;
  while (await Product.exists({ slug: candidate, _id: { $ne: excludeId } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export async function listProducts(filters: ProductFilterInput & { activeOnly?: boolean }) {
  const filter: Record<string, unknown> = {};
  if (filters.activeOnly !== false) filter.isActive = true;
  if (filters.category) {
    if (OBJECT_ID_PATTERN.test(filters.category)) {
      filter.category = filters.category;
    } else {
      const category = await Category.findOne({ slug: filters.category }).select("_id");
      // No matching category - force an empty result set rather than
      // silently ignoring the filter.
      filter.category = category?._id ?? null;
    }
  }
  if (filters.brand) filter.brand = filters.brand;
  if (filters.onSale) filter.discount = { $ne: null };
  if (filters.search) filter.$text = { $search: filters.search };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filter.price = {
      ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {}),
    };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    rating: { ratingAverage: -1 },
    popular: { viewCount: -1 },
  };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category")
      .populate("images")
      .populate("discount")
      .sort(sortMap[filters.sort] ?? sortMap.newest)
      .skip(getSkip(filters.page, filters.limit))
      .limit(filters.limit),
    Product.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, filters.page, filters.limit);
}

export async function getProductBySlug(slug: string, options?: { incrementView?: boolean }) {
  const product = await Product.findOne({ slug, isActive: true })
    .populate("category")
    .populate("images")
    .populate("discount")
    .populate("seller");
  if (!product) throw new NotFoundError("Product not found");

  if (options?.incrementView) {
    product.viewCount += 1;
    await product.save();
  }

  return product;
}

export async function getProductById(productId: string) {
  const product = await Product.findById(productId)
    .populate("category")
    .populate("images")
    .populate("discount");
  if (!product) throw new NotFoundError("Product not found");
  return product;
}

function resolveTargetSellerId(actor: Actor, input: { seller?: string }): string {
  if (actor.role === "ADMIN") {
    if (!input.seller) throw new ForbiddenError("Select a seller to assign this product to");
    return input.seller;
  }
  if (actor.role === "SELLER") return actor.id;
  throw new ForbiddenError("Only sellers and admins can manage products");
}

export async function createProduct(actor: Actor, input: CreateProductInput): Promise<IProduct> {
  const sellerId = resolveTargetSellerId(actor, input);
  await assertSellerOwnsCategory(sellerId, input.category);

  const slug = await resolveUniqueSlug(input.name);

  const product = await Product.create({
    seller: sellerId,
    category: input.category,
    name: input.name,
    slug,
    description: input.description,
    price: input.price,
    stock: input.stock,
    sku: input.sku,
    brand: input.brand,
    tags: input.tags,
    isFeatured: input.isFeatured,
    isTrending: input.isTrending,
    isRecommended: input.isRecommended,
    createdByAdmin: actor.role === "ADMIN",
  });

  const images = await ProductImage.insertMany(
    input.images.map((image, index) => ({
      product: product._id,
      url: image.url,
      altText: image.altText,
      isPrimary: image.isPrimary || index === 0,
      sortOrder: index,
    }))
  );
  product.images = images.map((image) => image._id);

  if (input.discountPrice && input.discountPrice < input.price) {
    const discount = await createProductPriceDiscount(actor, product._id.toString(), input.price, input.discountPrice);
    product.discount = discount._id;
  }

  await product.save();

  await writeAuditLog({
    actor: actor.id,
    action: "PRODUCT_CREATED",
    entityType: "Product",
    entityId: product._id.toString(),
  });

  return product;
}

async function assertCanManageProduct(actor: Actor, product: IProduct) {
  if (actor.role === "ADMIN") return;
  if (actor.role === "SELLER" && product.seller.toString() === actor.id) return;
  throw new ForbiddenError("You do not have permission to manage this product");
}

export async function updateProduct(actor: Actor, productId: string, input: UpdateProductInput) {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError("Product not found");
  await assertCanManageProduct(actor, product);

  if (input.category) {
    await assertSellerOwnsCategory(product.seller.toString(), input.category);
    product.category = input.category as never;
  }
  if (input.name) {
    product.name = input.name;
    product.slug = await resolveUniqueSlug(input.name, productId);
  }
  if (input.description !== undefined) product.description = input.description;
  if (input.price !== undefined) product.price = input.price;
  if (input.stock !== undefined) product.stock = input.stock;
  if (input.sku !== undefined) product.sku = input.sku;
  if (input.brand !== undefined) product.brand = input.brand;
  if (input.tags !== undefined) product.tags = input.tags;
  if (input.isFeatured !== undefined) product.isFeatured = input.isFeatured;
  if (input.isTrending !== undefined) product.isTrending = input.isTrending;
  if (input.isRecommended !== undefined) product.isRecommended = input.isRecommended;

  if (input.images && input.images.length > 0) {
    await ProductImage.deleteMany({ product: product._id });
    const images = await ProductImage.insertMany(
      input.images.map((image, index) => ({
        product: product._id,
        url: image.url,
        altText: image.altText,
        isPrimary: image.isPrimary || index === 0,
        sortOrder: index,
      }))
    );
    product.images = images.map((image) => image._id);
  }

  if (input.discountPrice !== undefined) {
    if (input.discountPrice && input.discountPrice < product.price) {
      await Discount.deleteOne({ _id: product.discount });
      const discount = await createProductPriceDiscount(actor, product._id.toString(), product.price, input.discountPrice);
      product.discount = discount._id;
    } else {
      await Discount.deleteOne({ _id: product.discount });
      product.discount = null;
    }
  }

  await product.save();

  await writeAuditLog({
    actor: actor.id,
    action: "PRODUCT_UPDATED",
    entityType: "Product",
    entityId: product._id.toString(),
  });

  return product;
}

export async function deleteProduct(actor: Actor, productId: string) {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError("Product not found");
  await assertCanManageProduct(actor, product);

  await ProductImage.deleteMany({ product: product._id });
  if (product.discount) await Discount.deleteOne({ _id: product.discount });
  await product.deleteOne();

  await writeAuditLog({
    actor: actor.id,
    action: "PRODUCT_DELETED",
    entityType: "Product",
    entityId: productId,
  });
}

export async function listSellerProducts(
  actor: Actor,
  params: { page: number; limit: number; sellerId?: string }
) {
  const sellerId = actor.role === "ADMIN" ? params.sellerId : actor.id;
  if (!sellerId) throw new ForbiddenError();

  const filter = { seller: sellerId };
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category")
      .populate("images")
      .populate("discount")
      .sort({ createdAt: -1 })
      .skip(getSkip(params.page, params.limit))
      .limit(params.limit),
    Product.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, params.page, params.limit);
}

export async function getLowStockProducts(sellerId?: string) {
  const filter: Record<string, unknown> = { stock: { $lt: LOW_STOCK_THRESHOLD }, isActive: true };
  if (sellerId) filter.seller = sellerId;
  return Product.find(filter).populate("category").sort({ stock: 1 });
}

export async function decrementStock(productId: string, quantity: number) {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError("Product not found");

  product.stock = Math.max(0, product.stock - quantity);
  await product.save();

  if (product.stock < LOW_STOCK_THRESHOLD) {
    await createNotification({
      user: product.seller.toString(),
      type: "LOW_STOCK",
      title: "Low stock warning",
      message: `${product.name} has only ${product.stock} unit(s) left in stock.`,
      link: `/seller/products/${product._id.toString()}/edit`,
    });
  }

  return product;
}
