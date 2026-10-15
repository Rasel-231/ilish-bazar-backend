import { ApiError } from '../errors/ApiError';
import type { IAuthenticatedUser, TAuthContext } from '../types';

/**
 * Returns the authenticated user attached by the `auth` middleware or throws
 * a 401. Use this in controllers that sit behind `auth()` instead of the
 * non-null assertion operator.
 */
export const getAuthenticatedUser = (req: TAuthContext): IAuthenticatedUser => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication context is required for this operation!');
  }

  return req.user;
};
