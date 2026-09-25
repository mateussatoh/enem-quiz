export type ApiErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "NOT_FOUND"
  | "QUIZ_NOT_FOUND"
  | "LEAD_NOT_FOUND"
  | "RESULT_NOT_FOUND"
  | "INCOMPLETE_ANSWERS"
  | "INVALID_OPTION"
  | "DUPLICATE_LEAD"
  | "RATE_LIMITED"
  | "INTERNAL";

export type ApiErrorPayload = {
  error: {
    code: ApiErrorCode;
    message: string;
    /** Field-level messages keyed by dotted path, present on VALIDATION errors. */
    fields?: Record<string, string>;
  };
};
