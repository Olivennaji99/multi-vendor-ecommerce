import type { ProductCardData } from "@shared/lib/product-presentation";

import { FlashSaleCountdown } from "./flash-sale-countdown";
import { ProductCard } from "./product-card";

export function FlashSaleSection({
  products,
  endsAt,
}: {
  products: ProductCardData[];
  endsAt: string | null;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Flash Sale</h2>
        {endsAt && <FlashSaleCountdown endsAt={endsAt} />}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
