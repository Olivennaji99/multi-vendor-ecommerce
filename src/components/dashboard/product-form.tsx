"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createProductSchema, type CreateProductInput } from "@shared/schemas/product.schema";

import { createProductAction, updateProductAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CategoryOption {
  id: string;
  name: string;
}

interface SellerOption {
  id: string;
  label: string;
}

interface UploadedImage {
  url: string;
  altText: string;
  isPrimary: boolean;
}

interface ProductFormDefaults extends Partial<CreateProductInput> {
  images?: UploadedImage[];
}

export function ProductForm({
  categories,
  sellers,
  productId,
  defaultValues,
}: {
  categories: CategoryOption[];
  sellers?: SellerOption[];
  productId?: string;
  defaultValues?: ProductFormDefaults;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>(defaultValues?.images ?? []);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? 0,
      discountPrice: defaultValues?.discountPrice ?? undefined,
      stock: defaultValues?.stock ?? 0,
      sku: defaultValues?.sku ?? "",
      category: defaultValues?.category ?? "",
      brand: defaultValues?.brand ?? "",
      tags: defaultValues?.tags ?? [],
      isFeatured: defaultValues?.isFeatured ?? false,
      isTrending: defaultValues?.isTrending ?? false,
      isRecommended: defaultValues?.isRecommended ?? false,
      seller: defaultValues?.seller ?? undefined,
      images: defaultValues?.images ?? [],
    },
  });

  const selectedCategory = watch("category");
  const selectedSeller = watch("seller");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.error?.message ?? "Upload failed");
        uploaded.push({ url: body.data.url, altText: file.name, isPrimary: false });
      }
      const next = [...images, ...uploaded].map((image, index) => ({
        ...image,
        isPrimary: index === 0,
      }));
      setImages(next);
      setValue("images", next, { shouldValidate: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    const next = images
      .filter((image) => image.url !== url)
      .map((image, index) => ({ ...image, isPrimary: index === 0 }));
    setImages(next);
    setValue("images", next, { shouldValidate: true });
  }

  async function onSubmit(data: CreateProductInput) {
    const result = productId
      ? await updateProductAction(productId, data)
      : await createProductAction(data);

    if (!result.success) {
      toast.error(result.formError ?? "Could not save product");
      return;
    }
    toast.success(productId ? "Product updated" : "Product created");
    router.push(sellers ? "/admin/products" : "/seller/products");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        {sellers && (
          <Field>
            <FieldLabel>Seller</FieldLabel>
            <Select value={selectedSeller} onValueChange={(value) => setValue("seller", value ?? undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a seller" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors.seller ? [errors.seller] : undefined} />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="name">Product name</FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" rows={4} {...register("description")} />
          <FieldError errors={errors.description ? [errors.description] : undefined} />
        </Field>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="price">Price</FieldLabel>
            <Input id="price" type="number" step="0.01" {...register("price")} />
            <FieldError errors={errors.price ? [errors.price] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="discountPrice">Discount price</FieldLabel>
            <Input id="discountPrice" type="number" step="0.01" {...register("discountPrice")} />
            <FieldError errors={errors.discountPrice ? [errors.discountPrice] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="stock">Stock</FieldLabel>
            <Input id="stock" type="number" {...register("stock")} />
            <FieldError errors={errors.stock ? [errors.stock] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="sku">SKU</FieldLabel>
            <Input id="sku" {...register("sku")} />
            <FieldError errors={errors.sku ? [errors.sku] : undefined} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue("category", value ?? "", { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors.category ? [errors.category] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="brand">Brand</FieldLabel>
            <Input id="brand" {...register("brand")} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="tags">Tags (comma separated)</FieldLabel>
          <Input
            id="tags"
            defaultValue={(defaultValues?.tags ?? []).join(", ")}
            onBlur={(event) =>
              setValue(
                "tags",
                event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              )
            }
          />
        </Field>
        <Field>
          <FieldLabel>Images</FieldLabel>
          <div className="flex flex-wrap gap-3">
            {images.map((image) => (
              <div key={image.url} className="relative size-20 overflow-hidden rounded-lg border">
                <Image src={image.url} alt={image.altText} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(image.url)}
                  className="absolute top-1 right-1 rounded-full bg-background/80 p-1"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground"
            >
              <UploadCloud className="size-4" />
              {isUploading ? "Uploading..." : "Add"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <FieldError errors={errors.images ? [errors.images] : undefined} />
        </Field>
        <FieldDescription>Choose which homepage sections this product should appear in.</FieldDescription>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("isFeatured")}
              onCheckedChange={(checked) => setValue("isFeatured", checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("isTrending")}
              onCheckedChange={(checked) => setValue("isTrending", checked)}
            />
            Trending
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("isRecommended")}
              onCheckedChange={(checked) => setValue("isRecommended", checked)}
            />
            Recommended
          </label>
        </div>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Saving..." : productId ? "Update product" : "Create product"}
        </Button>
      </FieldGroup>
    </form>
  );
}
