import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

interface IParsedRequest {
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

export const validateRequest =
  (schema: ZodTypeAny) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      })) as IParsedRequest;

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) Object.assign(req.query, parsed.query);
      if (parsed.params !== undefined) Object.assign(req.params, parsed.params);

      next();
    } catch (error) {
      next(error);
    }
  };
