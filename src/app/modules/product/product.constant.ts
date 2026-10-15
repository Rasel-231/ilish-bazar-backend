import { Prisma } from '@prisma/client';

export const productSearchableFields: string[] = ['name', 'category', 'description'];

export const productSortableFields = [
  'createdAt',
  'updatedAt',
  'name',
  'price',
  'stock',
] as const;

export const productSelect = {
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
} satisfies Prisma.ProductSelect;

export type TProduct = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
