import type { ApiErrorCode, ApiErrorPayload } from "@enem-quiz/shared/validators";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode | "NETWORK",
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const NETWORK_MESSAGE = "Sem conexão com o servidor. Verifique sua internet e tente de novo";

/** Thin fetch wrapper for the same-origin /api. Always throws ApiError with a pt-BR message. */
export async function api<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...rest,
      credentials: "same-origin",
      headers: { ...(json !== undefined && { "content-type": "application/json" }), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, "NETWORK", NETWORK_MESSAGE);
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (body as ApiErrorPayload | null)?.error;
    throw new ApiError(
      res.status,
      error?.code ?? "INTERNAL",
      error?.message ?? "Erro inesperado. Tente novamente",
      error?.fields,
    );
  }
  return body as T;
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

// Every query/mutation goes through `api`, so errors are always ApiError.
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}
