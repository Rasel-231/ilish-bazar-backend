import type { Response } from 'express';

import type { ISendResponse } from '../types';

export const sendResponse = <T>(res: Response, payload: ISendResponse<T>): void => {
  const { statusCode, success, message, data, meta } = payload;

  res.status(statusCode).json({
    success,
    message,
    ...(meta && { meta }),
    ...(data !== undefined && { data }),
  });
};
