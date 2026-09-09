import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthRouter } from './features/health/health.routes';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests. Please try again later.' },
      },
    }),
  );

  app.use('/api/health', healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
