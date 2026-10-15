import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../shared/paginationHelper';
import type {
  IAuthenticatedUser,
  IGenericResponse,
  IPaginationOptions,
} from '../../../types';
import {
  messageSearchableFields,
  messageSelect,
  messageSortableFields,
  type TMessage,
} from './message.constant';
import type {
  TCreateMessagePayload,
  TMessageFilters,
  TUpdateMessagePayload,
} from './message.interface';

const isAdmin = (user: IAuthenticatedUser): boolean => user.role === 'ADMIN';

const isSortableField = (value: string): value is (typeof messageSortableFields)[number] =>
  (messageSortableFields as readonly string[]).includes(value);

const buildAccessScope = (user: IAuthenticatedUser): Prisma.MessageWhereInput =>
  isAdmin(user) ? {} : { OR: [{ senderId: user.id }, { receiverId: user.id }] };

const buildMessageWhereInput = (
  filters: TMessageFilters,
  user: IAuthenticatedUser,
): Prisma.MessageWhereInput => {
  const { searchTerm, senderId, receiverId, parentId, isRead } = filters;
  const andConditions: Prisma.MessageWhereInput[] = [];

  const accessScope = buildAccessScope(user);

  if (Object.keys(accessScope).length > 0) {
    andConditions.push(accessScope);
  }

  if (searchTerm) {
    andConditions.push({
      OR: messageSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (senderId) {
    andConditions.push({ senderId });
  }

  if (receiverId) {
    andConditions.push({ receiverId });
  }

  if (parentId) {
    andConditions.push({ parentId });
  }

  if (isRead !== undefined) {
    andConditions.push({ isRead });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const resolveOrderBy = (
  sortBy: string,
  sortOrder: Prisma.SortOrder,
): Prisma.MessageOrderByWithRelationInput => {
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
};

const ensureUserExists = async (id: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!');
  }
};

const findAccessibleMessage = async (
  user: IAuthenticatedUser,
  id: string,
): Promise<TMessage> => {
  const message = await prisma.message.findFirst({
    where: { AND: [{ id }, buildAccessScope(user)] },
    select: messageSelect,
  });

  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found!');
  }

  return message;
};

const createMessage = async (
  sender: IAuthenticatedUser,
  payload: TCreateMessagePayload,
): Promise<TMessage> => {
  let receiverId = payload.receiverId;

  if (payload.parentId) {
    const parent = await prisma.message.findUnique({
      where: { id: payload.parentId },
      select: { id: true, senderId: true },
    });

    if (!parent) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Parent message not found!');
    }

    receiverId = payload.receiverId ?? parent.senderId;
  }

  if (receiverId) {
    if (receiverId === sender.id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot send a message to yourself!');
    }

    await ensureUserExists(receiverId);
  }

  return prisma.message.create({
    data: {
      content: payload.content,
      senderId: sender.id,
      ...(receiverId && { receiverId }),
      ...(payload.parentId && { parentId: payload.parentId }),
    },
    select: messageSelect,
  });
};

const getAllMessages = async (
  user: IAuthenticatedUser,
  filters: TMessageFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<TMessage[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const where = buildMessageWhereInput(filters, user);
  const orderBy = resolveOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([
    prisma.message.findMany({ where, skip, take: limit, orderBy, select: messageSelect }),
    prisma.message.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getMessageById = async (user: IAuthenticatedUser, id: string): Promise<TMessage> =>
  findAccessibleMessage(user, id);

const markMessageAsRead = async (
  user: IAuthenticatedUser,
  id: string,
): Promise<TMessage> => {
  await findAccessibleMessage(user, id);

  return prisma.message.update({
    where: { id },
    data: { isRead: true },
    select: messageSelect,
  });
};

const updateMessage = async (
  user: IAuthenticatedUser,
  id: string,
  payload: TUpdateMessagePayload,
): Promise<TMessage> => {
  const message = await findAccessibleMessage(user, id);

  if (message.senderId !== user.id && !isAdmin(user)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to update this message!');
  }

  return prisma.message.update({
    where: { id },
    data: {
      ...(payload.content !== undefined && { content: payload.content }),
      ...(payload.isRead !== undefined && { isRead: payload.isRead }),
    },
    select: messageSelect,
  });
};

const deleteMessage = async (
  user: IAuthenticatedUser,
  id: string,
): Promise<TMessage> => {
  const message = await findAccessibleMessage(user, id);

  if (message.senderId !== user.id && !isAdmin(user)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to delete this message!');
  }

  return prisma.message.delete({ where: { id }, select: messageSelect });
};

export const MessageService = {
  createMessage,
  getAllMessages,
  getMessageById,
  markMessageAsRead,
  updateMessage,
  deleteMessage,
};
