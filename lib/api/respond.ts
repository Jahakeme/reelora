import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiError, ApiErrorCode } from "@/types/api";

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

export class ApiException extends Error {
  code: ApiErrorCode;
  details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function error(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
) {
  const body: ApiError = { error: { code, message, details } };
  return NextResponse.json(body, { status: STATUS[code] });
}

export function handleRouteError(err: unknown) {
  if (err instanceof ApiException) {
    return error(err.code, err.message, err.details);
  }
  if (err instanceof ZodError) {
    return error("VALIDATION_ERROR", "Invalid request body", err.issues);
  }
  console.error("Unhandled route error:", err);
  return error("INTERNAL", "Something went wrong");
}
