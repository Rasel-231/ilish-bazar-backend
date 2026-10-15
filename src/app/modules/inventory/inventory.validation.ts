import { StockMovementType } from '@prisma/client';
import { z } from 'zod';

const stockMovementTypeSchema = z.nativeEnum(StockMovementType);
const sortableFields = ['createdAt'] as const;
const sortOrders = ['asc', 'desc'] as const;

const adjustStockSchema = z.object({
  body: z.object({
    catalogId: z.string().uuid('Invalid catalog id!'),
    type: stockMovementTypeSchema,
    quantity: z.coerce.number().int().nonnegative(),
    note: z.string().trim().max(500).optional(),
    reference: z.string().trim().max(100).optional(),
  }),
});

const listMovementsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(sortableFields).optional(),
    sortOrder: z.enum(sortOrders).optional(),
    catalogId: z.string().uuid('Invalid catalog id!').optional(),
    type: stockMovementTypeSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

const listLowStockSchema = z.object({
  query: z.object({
    threshold: z.coerce.number().int().nonnegative().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(sortableFields).optional(),
    sortOrder: z.enum(sortOrders).optional(),
  }),
});

const getStockSummarySchema = z.object({
  query: z.object({
    threshold: z.coerce.number().int().nonnegative().optional(),
  }),
});

export const inventoryValidation = {
  adjustStockSchema,
  listMovementsSchema,
  listLowStockSchema,
  getStockSummarySchema,
};
