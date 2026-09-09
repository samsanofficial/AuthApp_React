export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields: FieldErrors;

  constructor(status: number, code: string, message: string, fields: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  get isNetworkError() {
    return this.code === 'NETWORK_ERROR';
  }
}

interface ServerErrorBody {
  error?: { code?: string; message?: string; fields?: FieldErrors };
}

export function toApiError(error: unknown): ApiError {
  // The response interceptor already converts failures, so a second pass here
  // must not re-wrap them: an ApiError has no `.response` and would otherwise be
  // misreported as a network outage.
  if (error instanceof ApiError) return error;

  const axiosLike = error as {
    response?: { status?: number; data?: ServerErrorBody };
    code?: string;
    message?: string;
  };

  if (axiosLike?.response) {
    const status = axiosLike.response.status ?? 500;
    const body = axiosLike.response.data?.error;
    return new ApiError(
      status,
      body?.code ?? 'UNKNOWN',
      body?.message ?? 'Something went wrong. Please try again.',
      body?.fields ?? {},
    );
  }

  if (axiosLike?.code === 'ECONNABORTED') {
    return new ApiError(0, 'TIMEOUT', 'The request timed out. Please try again.');
  }

  return new ApiError(
    0,
    'NETWORK_ERROR',
    'Cannot reach the server. Check your connection and try again.',
  );
}
