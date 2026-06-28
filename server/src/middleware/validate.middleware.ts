import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { zodIssuesToFieldErrors } from "@shared/lib/zod";

type Source = "body" | "query" | "params";

export function validate(schema: ZodType, source: Source = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: { message: "Validation failed", fieldErrors: zodIssuesToFieldErrors(result.error) },
      });
      return;
    }

    // Express 5 makes `req.query` a getter-only property, so it can't be
    // reassigned like `req.body`/`req.params` can - store validated query
    // data separately instead.
    if (source === "query") {
      req.validatedQuery = result.data as Record<string, unknown>;
    } else {
      req[source] = result.data;
    }
    next();
  };
}
