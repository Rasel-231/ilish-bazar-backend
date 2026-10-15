import { StatusCodes } from 'http-status-codes';

import type {
  TBodyParamsRequest,
  TParamsRequest,
  TQueryRequest,
  TRequest,
} from '../../../types';
import { catchAsync } from '../../../utils/catchAsync';
import { getAuthenticatedUser } from '../../../utils/requestHelper';
import { sendResponse } from '../../../utils/sendResponse';
import type {
  TCreateUserPayload,
  TRegisterUserPayload,
  TUpdateProfilePayload,
  TUpdateUserPayload,
  TUserFilters,
  TUserIdParam,
} from './user.interface';
import { UserService } from './user.service';

const createUserAccount = catchAsync(
  async (req: TRequest<TCreateUserPayload | TRegisterUserPayload>, res) => {
    const result = await UserService.createUserAccount(req.body, req.file?.path);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'User created successfully!',
      data: result,
    });
  },
);

const getAllUsers = catchAsync(async (req: TQueryRequest<TUserFilters>, res) => {
  const { meta, data } = await UserService.getAllUsers(req.query, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully!',
    meta,
    data,
  });
});

const getUserById = catchAsync(async (req: TParamsRequest<TUserIdParam>, res) => {
  const result = await UserService.getUserById(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully!',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: TRequest, res) => {
  const result = await UserService.getMyProfile(getAuthenticatedUser(req).id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile retrieved successfully!',
    data: result,
  });
});

const updateUser = catchAsync(
  async (req: TBodyParamsRequest<TUpdateUserPayload, TUserIdParam>, res) => {
    const result = await UserService.updateUser(req.params.id, req.body, req.file?.path);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User updated successfully!',
      data: result,
    });
  },
);

const updateMyProfile = catchAsync(async (req: TRequest<TUpdateProfilePayload>, res) => {
  const result = await UserService.updateMyProfile(
    getAuthenticatedUser(req).id,
    req.body,
    req.file?.path,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully!',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: TParamsRequest<TUserIdParam>, res) => {
  const result = await UserService.deleteUser(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User deleted successfully!',
    data: result,
  });
});

export const UserController = {
  createUserAccount,
  getAllUsers,
  getUserById,
  getMyProfile,
  updateUser,
  updateMyProfile,
  deleteUser,
};
