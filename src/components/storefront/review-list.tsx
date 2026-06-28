import { Star } from "lucide-react";

import { listReviewsForProduct } from "@shared/services/review.service";

export async function ReviewList({ productId }: { productId: string }) {
  const { items } = await listReviewsForProduct(productId, { page: 1, limit: 10 });

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Be the first to review this product.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((review) => {
        const customer = review.customer as unknown as { name: string };
        return (
          <li key={review._id.toString()} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{customer.name}</span>
              <span className="flex items-center gap-1 text-sm text-warning">
                <Star className="size-3.5 fill-warning" /> {review.rating}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
          </li>
        );
      })}
    </ul>
  );
}
