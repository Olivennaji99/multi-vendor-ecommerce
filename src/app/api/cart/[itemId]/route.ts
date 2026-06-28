import { connectToDatabase } from "@shared/db/connection";
import { updateCartItemSchema } from "@shared/schemas/cart.schema";
import { removeCartItem, updateCartItemQuantity } from "@shared/services/cart.service";
import { UnauthorizedError } from "@shared/lib/errors";

import { auth } from "@/lib/auth";
import { handleRoute } from "@/lib/route-helpers";

interface RouteParams {
  params: Promise<{ itemId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const { itemId } = await params;
    const body = updateCartItemSchema.parse(await request.json());
    await connectToDatabase();
    return updateCartItemQuantity({ id: session.user.id, role: session.user.role }, itemId, body.quantity);
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const { itemId } = await params;
    await connectToDatabase();
    await removeCartItem({ id: session.user.id, role: session.user.role }, itemId);
    return { message: "Item removed" };
  });
}
