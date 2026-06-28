import { AppError, ValidationError } from "@shared/lib/errors";

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  formError?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, formError: error.message, fieldErrors: error.fieldErrors };
    }
    if (error instanceof AppError) {
      return { success: false, formError: error.message };
    }
    console.error(error);
    return { success: false, formError: "Something went wrong. Please try again." };
  }
}
