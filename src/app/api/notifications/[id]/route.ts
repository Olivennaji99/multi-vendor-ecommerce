import { connectToDatabase } from "@shared/db/connection";
import { markNotificationRead } from "@shared/services/notification.service";
import { UnauthorizedError } from "@shared/lib/errors";

import { auth } from "@/lib/auth";
import { handleRoute } from "@/lib/route-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const { id } = await params;
    await connectToDatabase();
    await markNotificationRead({ id: session.user.id, role: session.user.role }, id);
    return { message: "Notification marked as read" };
  });
}
