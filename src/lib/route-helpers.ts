import { NextResponse } from "next/server";

import { AppError, ValidationError } from "@shared/lib/errors";

export async function handleRoute<T>(fn: () => Promise<T>): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: { message: error.message, fieldErrors: error.fieldErrors } },
        { status: error.statusCode }
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: error.statusCode }
      );
    }
    console.error(error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
