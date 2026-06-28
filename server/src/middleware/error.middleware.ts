import type { NextFunction, Request, Response } from "express";

import { AppError, ValidationError } from "@shared/lib/errors";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: { message: "Route not found" } });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, fieldErrors: err.fieldErrors },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    return;
  }

  console.error(err);
  res.status(500).json({ success: false, error: { message: "Internal server error" } });
}
