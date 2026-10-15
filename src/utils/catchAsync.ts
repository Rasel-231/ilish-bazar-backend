import type { NextFunction, Request, Response, RequestHandler } from 'express';

/**
 * Wraps an async controller so rejected promises are forwarded to the global
 * error handler. The generic request/response types allow controllers to
 * declare precise (Zod-inferred) body/params/query shapes.
 */
export const catchAsync = <TReq = Request, TRes = Response>(
  fn: (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>,
): RequestHandler => {
  return (req, res, next) => {
    void fn(req as unknown as TReq, res as unknown as TRes, next).catch(next);
  };
};
