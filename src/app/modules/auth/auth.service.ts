import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import config from '../../../config';
import { ApiError } from '../../../errors/ApiError';
import { jwtHelpers } from '../../../shared/jwtHelpers';
import prisma from '../../../shared/prisma';
import {
  RESET_TOKEN_EXPIRES_IN,
  buildResetLink,
  buildTokens,
} from './auth.constant';
import { sendResetPasswordEmail } from './auth.email';
import type {
  IAuthTokens,
  IRefreshTokenDecoded,
  IResetTokenDecoded,
  TChangePasswordPayload,
  TForgotPasswordPayload,
  TLoginPayload,
  TRefreshTokenPayload,
  TResetPasswordPayload,
} from './auth.interface';

const invalidCredentialsMessage = 'Invalid email or password!';

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  return user;
};

const ensureActive = (isActive: boolean): void => {
  if (!isActive) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account is inactive!');
  }
};

const login = async (payload: TLoginPayload): Promise<IAuthTokens> => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, invalidCredentialsMessage);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, invalidCredentialsMessage);
  }

  ensureActive(user.isActive);

  return buildTokens(user.id, user.email, user.role, user.tokenVersion);
};

const refreshToken = async (payload: TRefreshTokenPayload): Promise<IAuthTokens> => {
  const token = payload.refreshToken;

  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token is required!');
  }

  let decoded: IRefreshTokenDecoded;
  try {
    decoded = jwtHelpers.verifyToken<IRefreshTokenDecoded>(
      token,
      config.jwt.refresh_secret,
    );
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired refresh token!');
  }

  const user = await getUserById(decoded.id);

  ensureActive(user.isActive);

  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Refresh token is no longer valid, please login again!',
    );
  }

  return buildTokens(user.id, user.email, user.role, user.tokenVersion);
};

const changePassword = async (
  userId: string,
  payload: TChangePasswordPayload,
): Promise<void> => {
  const { oldPassword, newPassword } = payload;

  const user = await getUserById(userId);

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Old password is not correct!');
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'New password must be different from the old password!',
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, Number(config.salt_rounds));

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, tokenVersion: { increment: 1 } },
  });
};

const forgotPassword = async (payload: TForgotPasswordPayload): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  // Do not disclose whether the email exists.
  if (!user || !user.isActive) {
    return;
  }

  const resetToken = jwtHelpers.createToken(
    { id: user.id, email: user.email, type: 'password-reset' },
    config.jwt.reset_secret,
    RESET_TOKEN_EXPIRES_IN,
  );

  await sendResetPasswordEmail(user.email, buildResetLink(resetToken));
};

const resetPassword = async (payload: TResetPasswordPayload): Promise<void> => {
  const { token, newPassword } = payload;

  let decoded: IResetTokenDecoded;
  try {
    decoded = jwtHelpers.verifyToken<IResetTokenDecoded>(token, config.jwt.reset_secret);
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired reset token!');
  }

  const user = await getUserById(decoded.id);

  ensureActive(user.isActive);

  const hashedPassword = await bcrypt.hash(newPassword, Number(config.salt_rounds));

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, tokenVersion: { increment: 1 } },
  });
};

export const AuthService = {
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
