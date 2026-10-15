import { ProductUnit } from '@prisma/client';
import { z } from 'zod';

const booleanFromString = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value) => value === 'true'),
]);

const unitSchema = z.nativeEnum(ProductUnit);
const sortableFields = ['createdAt', 'updatedAt', 'name', 'price', 'stock'] as const;
const sortOrders = ['asc', 'desc'] as const;

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product id!'),
  }),
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(2000).optional(),
    price: z.coerce.number().nonnegative(),
    stock: z.coerce.number().int().nonnegative().optional(),
    unit: unitSchema.optional(),
    category: z.string().trim().max(100).optional(),
    isActive: booleanFromString.optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    price: z.coerce.number().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    unit: unitSchema.optional(),
    category: z.string().trim().max(100).optional(),
    isActive: booleanFromString.optional(),
  }),
});

const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(sortableFields).optional(),
    sortOrder: z.enum(sortOrders).optional(),
    searchTerm: z.string().trim().min(1).max(150).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    isActive: booleanFromString.optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
  }),
});

export const productValidation = {
  idParamSchema,
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
};
