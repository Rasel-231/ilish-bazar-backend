import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Request target not recognized: ${req.method} ${req.originalUrl}`));
};