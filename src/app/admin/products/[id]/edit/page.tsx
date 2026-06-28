import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { connectToDatabase } from "@shared/db/connection";
import { NotFoundError } from "@shared/lib/errors";
import { listCategories } from "@shared/services/category.service";
import { getProductById } from "@shared/services/product.service";
import { listSellers } from "@shared/services/seller.service";

import { auth } from "@/lib/auth";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Edit Product | Admin" };
export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdminProductPage({ params }: EditProductPageProps) {
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

  const [categories, sellersResult] = await Promise.all([
    listCategories({ activeOnly: true }),
    listSellers({ id: session!.user.id, role: session!.user.role }, { page: 1, limit: 100 }),
  ]);

  const sellers = sellersResult.items.map((profile) => {
    const doc = profile as unknown as {
      user: { _id: { toString(): string }; name: string };
      storeName: string;
    };
    return { id: doc.user._id.toString(), label: `${doc.storeName} (${doc.user.name})` };
  });

  const category = product.category as unknown as { _id: { toString(): string } };
  const images = product.images as unknown as { url: string; altText: string; isPrimary: boolean }[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
      <div className="max-w-2xl">
        <ProductForm
          productId={id}
          categories={categories.map((c) => ({ id: c._id.toString(), name: c.name }))}
          sellers={sellers}
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
            seller: product.seller.toString(),
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
