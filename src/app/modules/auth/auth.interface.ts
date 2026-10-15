import type { JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';

import { authValidation } from './auth.validation';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenDecoded extends JwtPayload {
  id: string;
  email: string;
  tokenVersion: number;
}

export interface IResetTokenDecoded extends JwtPayload {
  id: string;
  email: string;
}

export type TLoginPayload = z.infer<typeof authValidation.loginSchema>['body'];
export type TRefreshTokenPayload = z.infer<typeof authValidation.refreshTokenSchema>['body'];
export type TChangePasswordPayload = z.infer<
  typeof authValidation.changePasswordSchema
>['body'];
export type TForgotPasswordPayload = z.infer<
  typeof authValidation.forgotPasswordSchema
>['body'];
export type TResetPasswordPayload = z.infer<
  typeof authValidation.resetPasswordSchema
>['body'];
