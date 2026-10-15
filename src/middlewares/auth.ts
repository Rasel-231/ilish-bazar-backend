import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import config from '../config';
import { ApiError } from '../errors/ApiError';
import type { IAuthenticatedUser, TUserRole } from '../types';

interface IAccessTokenPayload extends JwtPayload {
  id?: string;
  email?: string;
  role?: TUserRole;
  type?: string;
}

const extractTokenFromRequest = (req: Request): string | null => {
  const cookieToken = req.cookies?.accessToken;

  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice(7).trim();
  }

  return null;
};

const verifyRequestToken = (token: string): IAuthenticatedUser => {
  let decodedToken: IAccessTokenPayload;

  try {
    decodedToken = jwt.verify(token, config.jwt.access_secret) as IAccessTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Authentication token expired, please refresh!');
    }

    throw new ApiError(401, 'Invalid or tampered authentication token detected!');
  }

  const { id, email, role } = decodedToken;

  if (!id || !email || !role) {
    throw new ApiError(401, 'Authentication token payload is missing required claims!');
  }

  if (decodedToken.type !== 'access') {
    throw new ApiError(401, 'Invalid authentication token type detected!');
  }

  return { id, email, role };
};

export const auth =
  (...allowedRoles: TUserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const rawToken = extractTokenFromRequest(req);

      if (!rawToken) {
        throw new ApiError(401, 'Authentication token is missing from the request!');
      }

      const authenticatedUser = verifyRequestToken(rawToken);

      if (allowedRoles.length > 0 && !allowedRoles.includes(authenticatedUser.role)) {
        throw new ApiError(403, 'Insufficient privileges for this operation!');
      }

      req.user = authenticatedUser;
      next();
    } catch (error) {
      next(error);
    }
  };

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const rawToken = extractTokenFromRequest(req);

  if (!rawToken) {
    next();
    return;
  }

  try {
    req.user = verifyRequestToken(rawToken);
  } catch {
    req.user = undefined;
  }

  next();
};
