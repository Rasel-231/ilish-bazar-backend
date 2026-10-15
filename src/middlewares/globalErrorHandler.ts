import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import config from '../config';
import { ApiError } from '../errors/ApiError';
import type { IGenericErrorMessage } from '../types';

interface IResolvedError {
  statusCode: number;
  message: string;
  errorDetails?: IGenericErrorMessage[];
}

const resolveError = (error: unknown): IResolvedError => {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, message: error.message };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      message: 'Validation Error',
      errorDetails: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      return {
        statusCode: 409,
        message: `Duplicate value for: ${Array.isArray(target) ? target.join(', ') : 'unique field'}!`,
      };
    }

    if (error.code === 'P2025') {
      return { statusCode: 404, message: 'Requested resource not found!' };
    }

    if (error.code === 'P2003') {
      return {
        statusCode: 409,
        message: 'Operation violates a related resource constraint!',
      };
    }
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return { statusCode: 400, message: 'Malformed JSON payload received!' };
  }

  if (error instanceof Error) {
    return { statusCode: 500, message: error.message };
  }

  return { statusCode: 500, message: 'Internal Server Error' };
};

export const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const { statusCode, message, errorDetails } = resolveError(error);

  res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails && { errorDetails }),
    ...(!config.isProduction && error instanceof Error && { stack: error.stack }),
  });
};
