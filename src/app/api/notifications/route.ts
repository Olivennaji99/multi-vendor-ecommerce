import { connectToDatabase } from "@shared/db/connection";
import { listNotificationsForUser, markAllNotificationsRead } from "@shared/services/notification.service";
import { UnauthorizedError } from "@shared/lib/errors";

import { auth } from "@/lib/auth";
import { handleRoute } from "@/lib/route-helpers";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    await connectToDatabase();
    return listNotificationsForUser(
      { id: session.user.id, role: session.user.role },
      { page, limit, unreadOnly }
    );
  });
}

export async function PATCH() {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    await connectToDatabase();
    await markAllNotificationsRead({ id: session.user.id, role: session.user.role });
    return { message: "All notifications marked as read" };
  });
}
