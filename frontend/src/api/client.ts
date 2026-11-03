import { throwApiError } from "./exceptionHandler.ts";

export { ApiError, type ApiErrorResponse } from "./exceptionHandler.ts";

const API_BASE_URL = "http://localhost:3000";

type RequestOptions = {
  method?: string;
  body?: unknown;
};

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, method } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let data: unknown;

    try {
      data = await response.json();
    } catch {
      data = undefined;
    }

    throwApiError(data, response.status);
  }

  const data = (await response.json()) as T;
  return data;
}
