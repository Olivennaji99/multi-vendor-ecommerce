import { getStorageProvider } from "@shared/providers/storage";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@shared/lib/errors";

import { auth } from "@/lib/auth";
import { handleRoute } from "@/lib/route-helpers";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
      throw new ForbiddenError();
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new ValidationError("No file was uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    const storageProvider = getStorageProvider();
    return storageProvider.upload(
      { buffer, originalName: file.name, mimeType: file.type },
      { folder: "products" }
    );
  });
}
