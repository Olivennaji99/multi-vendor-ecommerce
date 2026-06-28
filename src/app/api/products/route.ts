import { connectToDatabase } from "@shared/db/connection";
import { productFilterSchema } from "@shared/schemas/product.schema";
import { listProducts } from "@shared/services/product.service";

import { handleRoute } from "@/lib/route-helpers";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const url = new URL(request.url);
    const filters = productFilterSchema.parse(Object.fromEntries(url.searchParams));

    await connectToDatabase();
    return listProducts(filters);
  });
}
