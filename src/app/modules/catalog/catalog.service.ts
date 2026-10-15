import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../shared/paginationHelper';
import type { IGenericResponse, IPaginationOptions } from '../../../types';
import {
  productSearchableFields,
  productSelect,
  productSortableFields,
  type TProduct,
} from './product.constant';
import type {
  TCreateProductPayload,
  TProductFilters,
  TUpdateProductPayload,
} from './product.interface';

const isSortableField = (value: string): value is (typeof productSortableFields)[number] =>
  (productSortableFields as readonly string[]).includes(value);

const buildProductWhereInput = (filters: TProductFilters): Prisma.ProductWhereInput => {
  const { searchTerm, category, isActive, minPrice, maxPrice } = filters;
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (category) {
    andConditions.push({ category: { equals: category, mode: 'insensitive' } });
  }

  if (isActive !== undefined) {
    andConditions.push({ isActive });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const resolveOrderBy = (
  sortBy: string,
  sortOrder: Prisma.SortOrder,
): Prisma.ProductOrderByWithRelationInput => {
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
};

const createProduct = async (
  payload: TCreateProductPayload,
  createdById?: string,
  uploadedFilePath?: string,
): Promise<TProduct> =>
  prisma.product.create({
    data: {
      name: payload.name,
      price: payload.price,
      ...(payload.description && { description: payload.description }),
      ...(payload.stock !== undefined && { stock: payload.stock }),
      ...(payload.unit && { unit: payload.unit }),
      ...(payload.category && { category: payload.category }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      ...(uploadedFilePath && { imageUrl: uploadedFilePath }),
      ...(createdById && { createdById }),
    },
    select: productSelect,
  });

const getAllProducts = async (
  filters: TProductFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<TProduct[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const where = buildProductWhereInput(filters);
  const orderBy = resolveOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy, select: productSelect }),
    prisma.product.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getProductById = async (id: string): Promise<TProduct> => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: productSelect,
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found!');
  }

  return product;
};

const updateProduct = async (
  id: string,
  payload: TUpdateProductPayload,
  uploadedFilePath?: string,
): Promise<TProduct> => {
  await getProductById(id);

  return prisma.product.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.price !== undefined && { price: payload.price }),
      ...(payload.stock !== undefined && { stock: payload.stock }),
      ...(payload.unit && { unit: payload.unit }),
      ...(payload.category !== undefined && { category: payload.category }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      ...(uploadedFilePath && { imageUrl: uploadedFilePath }),
    },
    select: productSelect,
  });
};

const deleteProduct = async (id: string): Promise<TProduct> => {
  try {
    return await prisma.product.delete({ where: { id }, select: productSelect });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found!');
      }

      if (error.code === 'P2003') {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'Product is referenced by existing orders and cannot be deleted!',
        );
      }
    }

    throw error;
  }
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
