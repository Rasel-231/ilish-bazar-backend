import express from 'express';

import { auth } from '../../../middlewares/auth';
import { rateLimiters } from '../../../middlewares/rateLimiter';
import { upload } from '../../../middlewares/upload';
import { validateRequest } from '../../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { userValidation } from './user.validation';

const router = express.Router();

router.post(
  '/register',
  rateLimiters.auth,
  upload.single('image'),
  validateRequest(userValidation.registerUserSchema),
  UserController.createUserAccount,
);

router.get('/me', auth(), UserController.getMyProfile);

router.patch(
  '/me',
  auth(),
  upload.single('image'),
  validateRequest(userValidation.updateProfileSchema),
  UserController.updateMyProfile,
);

router.get(
  '/',
  auth('ADMIN'),
  validateRequest(userValidation.listUsersSchema),
  UserController.getAllUsers,
);

router.post(
  '/',
  auth('ADMIN'),
  upload.single('image'),
  validateRequest(userValidation.createUserSchema),
  UserController.createUserAccount,
);

router.get(
  '/:id',
  auth('ADMIN'),
  validateRequest(userValidation.idParamSchema),
  UserController.getUserById,
);

router.patch(
  '/:id',
  auth('ADMIN'),
  upload.single('image'),
  validateRequest(userValidation.idParamSchema),
  validateRequest(userValidation.updateUserSchema),
  UserController.updateUser,
);

router.delete(
  '/:id',
  auth('ADMIN'),
  validateRequest(userValidation.idParamSchema),
  UserController.deleteUser,
);

export const UserRoutes = router;
