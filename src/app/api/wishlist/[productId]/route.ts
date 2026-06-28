import { connectToDatabase } from "@shared/db/connection";
import { addToWishlist, removeFromWishlist } from "@shared/services/wishlist.service";
import { UnauthorizedError } from "@shared/lib/errors";

import { auth } from "@/lib/auth";
import { handleRoute } from "@/lib/route-helpers";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const { productId } = await params;
    await connectToDatabase();
    return addToWishlist({ id: session.user.id, role: session.user.role }, productId);
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const { productId } = await params;
    await connectToDatabase();
    return removeFromWishlist({ id: session.user.id, role: session.user.role }, productId);
  });
}
