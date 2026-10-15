import express from 'express';
import { AuthController } from './auth.controller';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { rateLimiters } from '../../../middlewares/rateLimiter';
import { authValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/login',
  rateLimiters.auth,
  validateRequest(authValidation.loginSchema),
  AuthController.login
);

router.post('/logout', AuthController.logout);

router.post(
  '/refresh-token',
  rateLimiters.auth,
  validateRequest(authValidation.refreshTokenSchema),
  AuthController.refreshToken
);

router.post(
  '/change-password',
  auth(),
  validateRequest(authValidation.changePasswordSchema),
  AuthController.changePassword
);

router.post(
  '/forgot-password',
  rateLimiters.auth,
  validateRequest(authValidation.forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  rateLimiters.auth,
  validateRequest(authValidation.resetPasswordSchema),
  AuthController.resetPassword
);

export const AuthRoutes = router;
