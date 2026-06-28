export class ApiClientError extends Error {
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.fieldErrors = fieldErrors;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string; fieldErrors?: Record<string, string[]> };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok || !body.success) {
    throw new ApiClientError(body.error?.message ?? "Something went wrong", body.error?.fieldErrors);
  }

  return body.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: "POST", body: json !== undefined ? JSON.stringify(json) : undefined }),
  patch: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: "PATCH", body: json !== undefined ? JSON.stringify(json) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
