import type { Metadata } from "next";

import { connectToDatabase } from "@shared/db/connection";
import { formatDate } from "@shared/lib/format";
import { listReviewsForCustomer } from "@shared/services/review.service";

import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/states/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "My Reviews | NovaShop" };
export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const session = await auth();
  await connectToDatabase();
  const reviews = await listReviewsForCustomer({ id: session!.user.id, role: session!.user.role });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Reviews</h1>

      {reviews.length === 0 ? (
        <EmptyState title="You haven't written any reviews yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => {
            const product = review.product as unknown as { name: string; slug: string };
            return (
              <Card key={review._id.toString()}>
                <CardContent className="flex flex-col gap-1 p-4">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-warning">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
