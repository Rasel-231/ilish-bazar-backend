import { Prisma, StockMovementType } from '@prisma/client';
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
  inventoryCatalogSelect,
  stockMovementSelect,
  stockMovementSortableFields,
  type TInventoryCatalog,
  type TStockMovement,
} from './inventory.constant';
import type {
  TAdjustStockPayload,
  TLowStockQuery,
  TMovementFilters,
  TStockSummaryQuery,
} from './inventory.interface';

const DEFAULT_LOW_STOCK_THRESHOLD = 10;

const isSortableField = (value: string): value is (typeof stockMovementSortableFields)[number] =>
  (stockMovementSortableFields as readonly string[]).includes(value);

const buildMovementWhereInput = (filters: TMovementFilters): Prisma.StockMovementWhereInput => {
  const { catalogId, type, startDate, endDate } = filters;
  const andConditions: Prisma.StockMovementWhereInput[] = [];

  if (catalogId) {
    andConditions.push({ catalogId });
  }

  if (type) {
    andConditions.push({ type });
  }

  if (startDate || endDate) {
    andConditions.push({
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const resolveOrderBy = (
  sortBy: string,
  sortOrder: Prisma.SortOrder,
): Prisma.StockMovementOrderByWithRelationInput => {
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
};

const ensureCatalogExists = async (id: string): Promise<void> => {
  const catalog = await prisma.catalog.findUnique({ where: { id }, select: { id: true } });

  if (!catalog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Catalog not found!');
  }
};

const adjustStock = async (
  user: IAuthenticatedUser,
  payload: TAdjustStockPayload,
): Promise<TStockMovement> =>
  prisma.$transaction(async (tx) => {
    const catalog = await tx.catalog.findUnique({
      where: { id: payload.catalogId },
      select: { id: true, stock: true },
    });

    if (!catalog) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Catalog not found!');
    }

    const previousStock = catalog.stock;
    let newStock: number;

    if (payload.type === StockMovementType.SET) {
      await tx.catalog.update({
        where: { id: payload.catalogId },
        data: { stock: payload.quantity },
      });
      newStock = payload.quantity;
    } else if (payload.type === StockMovementType.OUT) {
      const result = await tx.catalog.updateMany({
        where: { id: payload.catalogId, stock: { gte: payload.quantity } },
        data: { stock: { decrement: payload.quantity } },
      });

      if (result.count === 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Insufficient stock! Only ${previousStock} available.`,
        );
      }

      newStock = previousStock - payload.quantity;
    } else {
      await tx.catalog.update({
        where: { id: payload.catalogId },
        data: { stock: { increment: payload.quantity } },
      });
      newStock = previousStock + payload.quantity;
    }

    return tx.stockMovement.create({
      data: {
        catalogId: payload.catalogId,
        type: payload.type,
        quantity: payload.quantity,
        previousStock,
        newStock,
        ...(payload.note && { note: payload.note }),
        ...(payload.reference && { reference: payload.reference }),
        createdById: user.id,
      },
      select: stockMovementSelect,
    });
  });

const getAllMovements = async (
  filters: TMovementFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<TStockMovement[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const where = buildMovementWhereInput(filters);
  const orderBy = resolveOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({ where, skip, take: limit, orderBy, select: stockMovementSelect }),
    prisma.stockMovement.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getLowStockCatalogs = async (
  query: TLowStockQuery,
  options: IPaginationOptions,
): Promise<IGenericResponse<TInventoryCatalog[]>> => {
  const threshold = query.threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  const where = { stock: { lte: threshold } };
  const orderBy = { [field]: sortOrder } as Prisma.CatalogOrderByWithRelationInput;

  const [data, total] = await Promise.all([
    prisma.catalog.findMany({ where, skip, take: limit, orderBy, select: inventoryCatalogSelect }),
    prisma.catalog.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getStockSummary = async (
  query: TStockSummaryQuery,
): Promise<{
  threshold: number;
  totalCatalogItems: number;
  totalStockUnits: number;
  outOfStockCount: number;
  lowStockCount: number;
}> => {
  const threshold = query.threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

  const [totalCatalogItems, totalStockAgg, outOfStockCount, lowStockCount] =
    await Promise.all([
      prisma.catalog.count(),
      prisma.catalog.aggregate({ _sum: { stock: true } }),
      prisma.catalog.count({ where: { stock: 0 } }),
      prisma.catalog.count({ where: { stock: { lte: threshold } } }),
    ]);

  return {
    threshold,
    totalCatalogItems,
    totalStockUnits: totalStockAgg._sum.stock ?? 0,
    outOfStockCount,
    lowStockCount,
  };
};

export const InventoryService = {
  adjustStock,
  getAllMovements,
  getLowStockCatalogs,
  getStockSummary,
};
