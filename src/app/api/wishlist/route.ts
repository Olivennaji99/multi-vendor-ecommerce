import { connectToDatabase } from "@shared/db/connection";
import { getWishlist } from "@shared/services/wishlist.service";
import { UnauthorizedError } from "@shared/lib/errors";

import { auth } from "@/lib/auth";
import { handleRoute } from "@/lib/route-helpers";

export async function GET() {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    await connectToDatabase();
    return getWishlist({ id: session.user.id, role: session.user.role });
  });
}
