import path from "path";

import { LocalStorageProvider } from "./local-storage.provider";
import type { StorageProvider } from "./storage-provider.interface";

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.STORAGE_PROVIDER ?? "local";

  if (providerName === "local") {
    const uploadRoot = process.env.UPLOAD_DIR
      ? path.resolve(process.env.UPLOAD_DIR)
      : path.resolve(process.cwd(), "public", "uploads");
    cachedProvider = new LocalStorageProvider(uploadRoot);
    return cachedProvider;
  }

  throw new Error(`Unsupported STORAGE_PROVIDER: ${providerName}`);
}

export * from "./storage-provider.interface";
