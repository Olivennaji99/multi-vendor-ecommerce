import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import type { StorageProvider, UploadInput, UploadResult } from "./storage-provider.interface";

export class LocalStorageProvider implements StorageProvider {
  constructor(
    private readonly uploadRoot: string,
    private readonly publicBasePath: string = "/uploads"
  ) {}

  async upload(file: UploadInput, options?: { folder?: string }): Promise<UploadResult> {
    const folder = options?.folder ?? "";
    const dir = path.join(this.uploadRoot, folder);
    await mkdir(dir, { recursive: true });

    const safeName = file.originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${randomUUID()}-${safeName}`;
    await writeFile(path.join(dir, filename), file.buffer);

    const key = folder ? `${folder}/${filename}` : filename;
    return { url: this.getPublicUrl(key), key };
  }

  async delete(key: string): Promise<void> {
    await unlink(path.join(this.uploadRoot, key)).catch(() => undefined);
  }

  getPublicUrl(key: string): string {
    return `${this.publicBasePath}/${key}`;
  }
}
