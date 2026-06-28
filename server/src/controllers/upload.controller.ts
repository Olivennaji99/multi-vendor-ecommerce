import type { Request, Response } from "express";

import { getStorageProvider } from "@shared/providers/storage";
import { ValidationError } from "@shared/lib/errors";

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) throw new ValidationError("No file was uploaded");

  const storageProvider = getStorageProvider();
  const result = await storageProvider.upload(
    {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    },
    { folder: "products" }
  );

  res.status(201).json({ success: true, data: result });
}
