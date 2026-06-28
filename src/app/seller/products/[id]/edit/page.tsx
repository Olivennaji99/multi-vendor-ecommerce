import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { connectToDatabase } from "@shared/db/connection";
import { ForbiddenError, NotFoundError } from "@shared/lib/errors";
import { getProductById } from "@shared/services/product.service";
import { getSellerProfile } from "@shared/services/seller.service";

import { auth } from "@/lib/auth";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Edit Product | Seller" };
export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSellerProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const session = await auth();
  await connectToDatabase();

  let product;
  try {
    product = await getProductById(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  if (product.seller.toString() !== session!.user.id) {
    throw new ForbiddenError("You do not have permission to edit this product");
  }

  const profile = await getSellerProfile(session!.user.id);
  const categories = profile.assignedCategories as unknown as { _id: { toString(): string }; name: string }[];
  const category = product.category as unknown as { _id: { toString(): string } };
  const images = product.images as unknown as { url: string; altText: string; isPrimary: boolean }[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
      <div className="max-w-2xl">
        <ProductForm
          productId={id}
          categories={categories.map((c) => ({ id: c._id.toString(), name: c.name }))}
          defaultValues={{
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            category: category._id.toString(),
            brand: product.brand,
            tags: product.tags,
            isFeatured: product.isFeatured,
            isTrending: product.isTrending,
            isRecommended: product.isRecommended,
            images: images.map((image) => ({
              url: image.url,
              altText: image.altText,
              isPrimary: image.isPrimary,
            })),
          }}
        />
      </div>
    </div>
  );
}
