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
  reviewSearchableFields,
  reviewSelect,
  reviewSortableFields,
  type TReview,
} from './review.constant';
import type {
  TCreateReviewPayload,
  TReviewFilters,
  TUpdateReviewPayload,
} from './review.interface';

const isAdmin = (user: IAuthenticatedUser): boolean => user.role === 'ADMIN';

const isSortableField = (value: string): value is (typeof reviewSortableFields)[number] =>
  (reviewSortableFields as readonly string[]).includes(value);

const buildVisibilityScope = (user?: IAuthenticatedUser): Prisma.ReviewWhereInput =>
  user && isAdmin(user) ? {} : { isApproved: true };

const buildReviewWhereInput = (
  filters: TReviewFilters,
  user?: IAuthenticatedUser,
): Prisma.ReviewWhereInput => {
  const { searchTerm, productId, userId, rating, isApproved } = filters;
  const andConditions: Prisma.ReviewWhereInput[] = [];

  const visibilityScope = buildVisibilityScope(user);

  if (Object.keys(visibilityScope).length > 0) {
    andConditions.push(visibilityScope);
  }

  if (searchTerm) {
    andConditions.push({
      OR: reviewSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (productId) {
    andConditions.push({ productId });
  }

  if (userId) {
    andConditions.push({ userId });
  }

  if (rating !== undefined) {
    andConditions.push({ rating });
  }

  if (isApproved !== undefined) {
    andConditions.push({ isApproved });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const resolveOrderBy = (
  sortBy: string,
  sortOrder: Prisma.SortOrder,
): Prisma.ReviewOrderByWithRelationInput => {
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
};

const ensureCatalogExists = async (id: string): Promise<void> => {
  const catalog = await prisma.catalog.findUnique({ where: { id }, select: { id: true } });

  if (!catalog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Catalog not found!');
  }
};

const findReviewOrThrow = async (id: string): Promise<TReview> => {
  const review = await prisma.review.findUnique({ where: { id }, select: reviewSelect });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found!');
  }

  return review;
};

const createReview = async (
  user: IAuthenticatedUser | undefined,
  payload: TCreateReviewPayload,
): Promise<TReview> => {
  await ensureCatalogExists(payload.productId);

  if (!user && !payload.guestName) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Guest name is required to submit a review without signing in!',
    );
  }

  return prisma.review.create({
    data: {
      productId: payload.productId,
      rating: payload.rating,
      ...(payload.title && { title: payload.title }),
      ...(payload.comment && { comment: payload.comment }),
      ...(user
        ? { userId: user.id }
        : {
            ...(payload.guestName && { guestName: payload.guestName }),
            ...(payload.guestEmail && { guestEmail: payload.guestEmail }),
          }),
    },
    select: reviewSelect,
  });
};

const getAllReviews = async (
  user: IAuthenticatedUser | undefined,
  filters: TReviewFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<TReview[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const where = buildReviewWhereInput(filters, user);
  const orderBy = resolveOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([
    prisma.review.findMany({ where, skip, take: limit, orderBy, select: reviewSelect }),
    prisma.review.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getReviewById = async (
  user: IAuthenticatedUser | undefined,
  id: string,
): Promise<TReview> => {
  const review = await prisma.review.findFirst({
    where: { AND: [{ id }, buildVisibilityScope(user)] },
    select: reviewSelect,
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found!');
  }

  return review;
};

const updateReview = async (
  user: IAuthenticatedUser,
  id: string,
  payload: TUpdateReviewPayload,
): Promise<TReview> => {
  const review = await findReviewOrThrow(id);

  if (review.userId !== user.id && !isAdmin(user)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to update this review!');
  }

  return prisma.review.update({
    where: { id },
    data: {
      ...(payload.rating !== undefined && { rating: payload.rating }),
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.comment !== undefined && { comment: payload.comment }),
    },
    select: reviewSelect,
  });
};

const updateReviewApproval = async (id: string, isApproved: boolean): Promise<TReview> => {
  await findReviewOrThrow(id);

  return prisma.review.update({
    where: { id },
    data: { isApproved },
    select: reviewSelect,
  });
};

const deleteReview = async (user: IAuthenticatedUser, id: string): Promise<TReview> => {
  const review = await findReviewOrThrow(id);

  if (review.userId !== user.id && !isAdmin(user)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to delete this review!');
  }

  return prisma.review.delete({ where: { id }, select: reviewSelect });
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  updateReviewApproval,
  deleteReview,
};
