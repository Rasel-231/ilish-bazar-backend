import { Prisma } from '@prisma/client';

export const catalogSearchableFields: string[] = ['name', 'category', 'description'];

export const catalogSortableFields = [
  'createdAt',
  'updatedAt',
  'name',
  'price',
  'stock',
] as const;

export const catalogSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  unit: true,
  imageUrl: true,
  category: true,
  isActive: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CatalogSelect;

export type TCatalog = Prisma.CatalogGetPayload<{ select: typeof catalogSelect }>;
