import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../shared/paginationHelper';
import type { IGenericResponse, IPaginationOptions } from '../../../types';
import {
  catalogSearchableFields,
  catalogSelect,
  catalogSortableFields,
  type TCatalog,
} from './catalog.constant';
import type {
  TCatalogFilters,
  TCreateCatalogPayload,
  TUpdateCatalogPayload,
} from './catalog.interface';

const isSortableField = (value: string): value is (typeof catalogSortableFields)[number] =>
  (catalogSortableFields as readonly string[]).includes(value);

const buildCatalogWhereInput = (filters: TCatalogFilters): Prisma.CatalogWhereInput => {
  const { searchTerm, category, isActive, minPrice, maxPrice } = filters;
  const andConditions: Prisma.CatalogWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: catalogSearchableFields.map((field) => ({
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
): Prisma.CatalogOrderByWithRelationInput => {
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
};

const createCatalog = async (
  payload: TCreateCatalogPayload,
  createdById?: string,
  uploadedFilePath?: string,
): Promise<TCatalog> =>
  prisma.catalog.create({
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
    select: catalogSelect,
  });

const getAllCatalogs = async (
  filters: TCatalogFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<TCatalog[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const where = buildCatalogWhereInput(filters);
  const orderBy = resolveOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([
    prisma.catalog.findMany({ where, skip, take: limit, orderBy, select: catalogSelect }),
    prisma.catalog.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getCatalogById = async (id: string): Promise<TCatalog> => {
  const catalog = await prisma.catalog.findUnique({
    where: { id },
    select: catalogSelect,
  });

  if (!catalog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Catalog not found!');
  }

  return catalog;
};

const updateCatalog = async (
  id: string,
  payload: TUpdateCatalogPayload,
  uploadedFilePath?: string,
): Promise<TCatalog> => {
  await getCatalogById(id);

  return prisma.catalog.update({
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
    select: catalogSelect,
  });
};

const deleteCatalog = async (id: string): Promise<TCatalog> => {
  try {
    return await prisma.catalog.delete({ where: { id }, select: catalogSelect });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Catalog not found!');
      }

      if (error.code === 'P2003') {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'Catalog is referenced by existing orders and cannot be deleted!',
        );
      }
    }

    throw error;
  }
};

export const CatalogService = {
  createCatalog,
  getAllCatalogs,
  getCatalogById,
  updateCatalog,
  deleteCatalog,
};
