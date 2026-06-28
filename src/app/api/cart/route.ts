import { connectToDatabase } from "@shared/db/connection";
import { addToCartSchema } from "@shared/schemas/cart.schema";
import { addToCart, clearCart, computeCartTotals, getCart } from "@shared/services/cart.service";
import { UnauthorizedError } from "@shared/lib/errors";

import { auth } from "@/lib/auth";
import { handleRoute } from "@/lib/route-helpers";

export async function GET() {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    await connectToDatabase();
    const actor = { id: session.user.id, role: session.user.role };
    const { items } = await getCart(actor);
    const totals = await computeCartTotals(actor);
    return { items, totals };
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const body = addToCartSchema.parse(await request.json());
    await connectToDatabase();
    return addToCart({ id: session.user.id, role: session.user.role }, body.product, body.quantity);
  });
}

export async function DELETE() {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    await connectToDatabase();
    await clearCart({ id: session.user.id, role: session.user.role });
    return { message: "Cart cleared" };
  });
}
