import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import * as controller from './auth.controller';

const limitMessage = {
  error: {
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many attempts. Please try again in a few minutes.',
  },
};

// Only rejected credentials count towards the limit. Validation errors are
// ordinary typos in the form, and counting them would lock a legitimate user
// out of their own account for mistyping the sign-in form ten times.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req, res) => res.statusCode !== 401,
  message: limitMessage,
});

// Here it is the successful creations that are capped, to stop one client
// mass-registering accounts.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipFailedRequests: true,
  requestWasSuccessful: (_req, res) => res.statusCode === 201,
  message: limitMessage,
});

export const authRouter = Router();

authRouter.post('/register', registerLimiter, asyncHandler(controller.register));
authRouter.post('/login', loginLimiter, asyncHandler(controller.login));
authRouter.post('/refresh', asyncHandler(controller.refresh));
authRouter.post('/logout', asyncHandler(controller.logout));
authRouter.post(
  '/biometric/token',
  requireAuth,
  asyncHandler(controller.createBiometricToken),
);
authRouter.post('/biometric/revoke', asyncHandler(controller.revokeBiometricToken));
authRouter.get('/me', requireAuth, asyncHandler(controller.me));
