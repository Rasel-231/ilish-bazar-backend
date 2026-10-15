import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import config from '../../../config';
import { ApiError } from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../shared/paginationHelper';
import type { IGenericResponse, IPaginationOptions } from '../../../types';
import {
  publicUserSelect,
  userSearchableFields,
  userSortableFields,
  type TPublicUser,
} from './user.constant';
import type {
  TCreateUserPayload,
  TUpdateProfilePayload,
  TUpdateUserPayload,
  TUserFilters,
} from './user.interface';

const isSortableField = (value: string): value is (typeof userSortableFields)[number] =>
  (userSortableFields as readonly string[]).includes(value);

const buildUserWhereInput = (filters: TUserFilters): Prisma.UserWhereInput => {
  const { searchTerm, email, role, isActive } = filters;
  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (email) {
    andConditions.push({ email: { equals: email, mode: 'insensitive' } });
  }

  if (role) {
    andConditions.push({ role });
  }

  if (isActive !== undefined) {
    andConditions.push({ isActive });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const resolveOrderBy = (
  sortBy: string,
  sortOrder: Prisma.SortOrder,
): Prisma.UserOrderByWithRelationInput => {
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
};

const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, Number(config.salt_rounds));

const ensureEmailAvailable = async (email: string, ignoreUserId?: string): Promise<void> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser && existingUser.id !== ignoreUserId) {
    throw new ApiError(StatusCodes.CONFLICT, 'A user with this email already exists!');
  }
};

const ensureUserExists = async (id: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!');
  }
};

const createUserAccount = async (
  payload: TCreateUserPayload,
  uploadedFilePath?: string,
): Promise<TPublicUser> => {
  await ensureEmailAvailable(payload.email);

  const hashedPassword = await hashPassword(payload.password);

  return prisma.user.create({
    data: {
      email: payload.email,
      name: payload.name,
      password: hashedPassword,
      ...(payload.role && { role: payload.role }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      ...(uploadedFilePath && { avatarUrl: uploadedFilePath }),
    },
    select: publicUserSelect,
  });
};

const getAllUsers = async (
  filters: TUserFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<TPublicUser[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const where = buildUserWhereInput(filters);
  const orderBy = resolveOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, orderBy, select: publicUserSelect }),
    prisma.user.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getUserById = async (id: string): Promise<TPublicUser> => {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  return user;
};

const updateUser = async (
  id: string,
  payload: TUpdateUserPayload,
  uploadedFilePath?: string,
): Promise<TPublicUser> => {
  await ensureUserExists(id);

  if (payload.email) {
    await ensureEmailAvailable(payload.email, id);
  }

  const data: Prisma.UserUpdateInput = {
    ...(payload.email && { email: payload.email }),
    ...(payload.name && { name: payload.name }),
    ...(payload.role && { role: payload.role }),
    ...(payload.isActive !== undefined && { isActive: payload.isActive }),
  };

  if (payload.password) {
    data.password = await hashPassword(payload.password);
    data.tokenVersion = { increment: 1 };
  }

  if (uploadedFilePath) {
    data.avatarUrl = uploadedFilePath;
  }

  return prisma.user.update({ where: { id }, data, select: publicUserSelect });
};

const deleteUser = async (id: string): Promise<TPublicUser> => {
  try {
    return await prisma.user.delete({ where: { id }, select: publicUserSelect });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!');
    }

    throw error;
  }
};

const getMyProfile = async (userId: string): Promise<TPublicUser> => getUserById(userId);

const updateMyProfile = async (
  userId: string,
  payload: TUpdateProfilePayload,
  uploadedFilePath?: string,
): Promise<TPublicUser> => {
  const safePayload: TUpdateUserPayload = {
    ...(payload.email && { email: payload.email }),
    ...(payload.name && { name: payload.name }),
    ...(payload.password && { password: payload.password }),
  };

  return updateUser(userId, safePayload, uploadedFilePath);
};

export const UserService = {
  createUserAccount,
  getAllUsers,
  getUserById,
  getMyProfile,
  updateUser,
  updateMyProfile,
  deleteUser,
};
