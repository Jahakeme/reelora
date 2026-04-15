export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "INTERNAL";

export type ApiError = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};
