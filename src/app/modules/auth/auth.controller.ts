import { StatusCodes } from 'http-status-codes';

import type { TRequest } from '../../../types';
import { catchAsync } from '../../../utils/catchAsync';
import { getAuthenticatedUser } from '../../../utils/requestHelper';
import { sendResponse } from '../../../utils/sendResponse';
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from './auth.constant';
import type {
  TChangePasswordPayload,
  TForgotPasswordPayload,
  TLoginPayload,
  TRefreshTokenPayload,
  TResetPasswordPayload,
} from './auth.interface';
import { AuthService } from './auth.service';

const login = catchAsync(async (req: TRequest<TLoginPayload>, res) => {
  const result = await AuthService.login(req.body);
  setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Logged in successfully!',
    data: result,
  });
});

const logout = catchAsync(async (_req: TRequest, res) => {
  clearAuthCookies(res);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Logged out successfully!',
    data: null,
  });
});

const refreshToken = catchAsync(async (req: TRequest<TRefreshTokenPayload>, res) => {
  const cookieToken = req.cookies?.[REFRESH_COOKIE];
  const token = typeof cookieToken === 'string' ? cookieToken : req.body.refreshToken;

  const result = await AuthService.refreshToken({ refreshToken: token });
  setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Access token refreshed successfully!',
    data: result,
  });
});

const changePassword = catchAsync(
  async (req: TRequest<TChangePasswordPayload>, res) => {
    await AuthService.changePassword(getAuthenticatedUser(req).id, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Password changed successfully!',
      data: null,
    });
  },
);

const forgotPassword = catchAsync(
  async (req: TRequest<TForgotPasswordPayload>, res) => {
    await AuthService.forgotPassword(req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Password reset link sent to your email!',
      data: null,
    });
  },
);

const resetPassword = catchAsync(async (req: TRequest<TResetPasswordPayload>, res) => {
  await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully!',
    data: null,
  });
});

export const AuthController = {
  login,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
