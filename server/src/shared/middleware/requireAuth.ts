import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../../features/auth/auth.tokens';
import { AppError } from '../errors/AppError';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(AppError.unauthorized('Authentication required'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(AppError.unauthorized('Your session has expired. Please sign in again.'));
  }
};
