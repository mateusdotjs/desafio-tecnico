export type ApiErrorResponse = {
  statusCode: number;
  message: string;
};

export class ApiError extends Error {
  readonly statusCode: number;

  constructor({ statusCode, message }: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export function throwApiError(data: unknown, httpStatus: number): never {
  if (
    typeof data === "object" &&
    data !== null &&
    typeof (data as ApiErrorResponse).statusCode === "number" &&
    typeof (data as ApiErrorResponse).message === "string"
  ) {
    throw new ApiError(data as ApiErrorResponse);
  }

  throw new ApiError({
    statusCode: httpStatus,
    message: "Erro ao comunicar com o servidor",
  });
}

export function getErrorMessage(
  error: unknown,
  fallback = "Erro ao comunicar com o servidor",
): string | undefined {
  if (error == null) {
    return undefined;
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}
