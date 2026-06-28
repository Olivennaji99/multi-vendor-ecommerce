"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  altText: string;
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const safeImages =
    images.length > 0 ? images : [{ url: "/placeholder-product.svg", altText: productName }];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <Image
          src={safeImages[activeIndex].url}
          alt={safeImages[activeIndex].altText || productName}
          fill
          sizes="(min-width: 1024px) 480px, 90vw"
          className="object-cover"
          priority
        />
      </div>
      {safeImages.length > 1 && (
        <div className="flex gap-2">
          {safeImages.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2",
                index === activeIndex ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={image.url}
                alt={image.altText || productName}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
