import { createLogger, format, transports } from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, prettyPrint, colorize, errors } =
  format;

const resolveMessage = (message: unknown): string =>
  typeof message === 'string' ? message : JSON.stringify(message);

const fileFormat = combine(
  label({ label: 'ilish-bazar' }),
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, label: logLabel, timestamp: logTimestamp }) => {
    const date = new Date(logTimestamp as string);
    const clock = date.toTimeString().split(' ')[0];
    return `${date.toDateString()} ${clock} [${logLabel}] ${level}: ${resolveMessage(message)}`;
  }),
  prettyPrint(),
);

const consoleFormat = combine(colorize(), fileFormat);

const buildRotatingTransport = (tone: 'success' | 'error') =>
  new DailyRotateFile({
    filename: path.join(
      process.cwd(),
      'logs',
      'winston',
      tone,
      `app-%DATE%-${tone}.log`,
    ),
    datePattern: 'DD-MM-YYYY-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  });

export const logger = createLogger({
  level: 'info',
  format: fileFormat,
  defaultMeta: { service: 'ilish-bazar-backend' },
  transports: [
    new transports.Console({ format: consoleFormat }),
    buildRotatingTransport('success'),
  ],
});

export const errlogger = createLogger({
  level: 'error',
  format: fileFormat,
  defaultMeta: { service: 'ilish-bazar-backend' },
  transports: [
    new transports.Console({ format: consoleFormat }),
    buildRotatingTransport('error'),
  ],
});
