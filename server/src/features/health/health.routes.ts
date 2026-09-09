import { Router } from 'express';
import { env } from '../../config/env';
import { checkDatabaseConnection } from '../../shared/db/pool';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const databaseConnected = await checkDatabaseConnection();

    res.status(databaseConnected ? 200 : 503).json({
      status: databaseConnected ? 'ok' : 'degraded',
      service: 'authenticator-api',
      environment: env.NODE_ENV,
      database: databaseConnected ? 'connected' : 'unavailable',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }),
);
