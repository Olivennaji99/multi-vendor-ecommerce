export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageProvider {
  upload(file: UploadInput, options?: { folder?: string }): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
