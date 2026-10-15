import { Request, Response, NextFunction } from 'express';
import config from '../config';

const SILENT_PATHS = ['/health'];

const resolveStatusTone = (statusCode: number): string => {
  if (statusCode >= 500) return 'FAIL';
  if (statusCode >= 400) return 'WARN';
  if (statusCode >= 300) return 'REDIRECT';
  return 'OK';
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    if (SILENT_PATHS.includes(req.path)) return;

    const elapsedMilliseconds = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const tone = resolveStatusTone(res.statusCode);
    const actorIdentity = req.user?.id ?? req.ip ?? 'unknown';
    const incomingUserAgent = req.get('user-agent') ?? 'unknown';

    const logLine = [
      `[${tone}]`,
      `${req.method} ${req.originalUrl}`,
      `status=${res.statusCode}`,
      `duration=${elapsedMilliseconds.toFixed(2)}ms`,
      `actor=${actorIdentity}`,
      `agent=${incomingUserAgent}`,
    ].join(' ');

    if (res.statusCode >= 500) {
      console.error(logLine);
    } else if (res.statusCode >= 400) {
      console.warn(logLine);
    } else if (config.env !== 'test') {
      console.log(logLine);
    }
  });

  next();
};