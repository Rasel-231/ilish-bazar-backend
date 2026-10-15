import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';

import router from './app/routes';
import config from './config';
import { ApiError } from './errors/ApiError';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { notFound } from './middlewares/notFound';
import { rateLimiters } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import prisma from './shared/prisma';

const app: Application = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(compression());

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || !config.isProduction || config.cors_origins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new ApiError(403, `Origin "${origin}" is not allowed by CORS policy!`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(requestLogger);
app.use(rateLimiters.global);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', database: 'up' });
  } catch {
    res.status(503).json({ status: 'unavailable', database: 'down' });
  }
});

app.use('/api/v1', router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
