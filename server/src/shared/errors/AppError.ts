export type FieldErrors = Record<string, string>;

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fields?: FieldErrors;

  constructor(statusCode: number, code: string, message: string, fields?: FieldErrors) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, fields?: FieldErrors) {
    return new AppError(400, 'BAD_REQUEST', message, fields);
  }

  static validation(message: string, fields: FieldErrors) {
    return new AppError(422, 'VALIDATION_ERROR', message, fields);
  }

  static unauthorized(message = 'Invalid credentials') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have access to this resource') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string, fields?: FieldErrors) {
    return new AppError(409, 'CONFLICT', message, fields);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new AppError(429, 'TOO_MANY_REQUESTS', message);
  }

  static internal(message = 'Something went wrong') {
    return new AppError(500, 'INTERNAL_ERROR', message);
  }
}
