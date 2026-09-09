import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import * as controller from './auth.controller';

// Credential endpoints get a much tighter limit than the global one to slow
// down password guessing.
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts. Please try again in a few minutes.',
    },
  },
});

export const authRouter = Router();

authRouter.post('/register', credentialsLimiter, asyncHandler(controller.register));
authRouter.post('/login', credentialsLimiter, asyncHandler(controller.login));
authRouter.post('/refresh', asyncHandler(controller.refresh));
authRouter.post('/logout', asyncHandler(controller.logout));
authRouter.get('/me', requireAuth, asyncHandler(controller.me));
