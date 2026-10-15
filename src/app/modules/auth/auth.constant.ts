import type { CookieOptions, Response } from 'express';

import config from '../../../config';
import { jwtHelpers } from '../../../shared/jwtHelpers';
import type { TUserRole } from '../../../types';
import type { IAuthTokens } from './auth.interface';

export const ACCESS_COOKIE = 'accessToken';
export const REFRESH_COOKIE = 'refreshToken';

export const RESET_TOKEN_EXPIRES_IN = '10m';

const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const isProd = config.isProduction;

export const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  maxAge: ACCESS_MAX_AGE,
};

export const refreshCookieOptions: CookieOptions = {
  ...accessCookieOptions,
  maxAge: REFRESH_MAX_AGE,
};

export const setAuthCookies = (res: Response, tokens: IAuthTokens): void => {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, accessCookieOptions);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions);
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_COOKIE, accessCookieOptions);
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
};

export const buildTokens = (
  userId: string,
  email: string,
  role: TUserRole,
  tokenVersion: number,
): IAuthTokens => {
  const accessToken = jwtHelpers.createToken(
    { id: userId, email, role, type: 'access' },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelpers.createToken(
    { id: userId, email, role, type: 'refresh', tokenVersion },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return { accessToken, refreshToken };
};

export const buildResetLink = (token: string): string =>
  `${config.frontend_url}/reset-password?token=${encodeURIComponent(token)}`;
