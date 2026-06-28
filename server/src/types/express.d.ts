import type { Actor } from "@shared/types/actor";

declare global {
  namespace Express {
    interface Request {
      user?: Actor;
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export {};
