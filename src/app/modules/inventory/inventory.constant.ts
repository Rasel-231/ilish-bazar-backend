import { Prisma } from '@prisma/client';

export const inventoryCatalogSelect = {
  id: true,
  name: true,
  stock: true,
  unit: true,
  imageUrl: true,
  category: true,
  isActive: true,
} satisfies Prisma.CatalogSelect;

export const inventoryMovementCatalogSelect = {
  id: true,
  name: true,
  unit: true,
} satisfies Prisma.CatalogSelect;

export const inventoryMovementUserSelect = {
  id: true,
  name: true,
} satisfies Prisma.UserSelect;

export const stockMovementSelect = {
  id: true,
  catalogId: true,
  type: true,
  quantity: true,
  previousStock: true,
  newStock: true,
  note: true,
  reference: true,
  createdById: true,
  createdAt: true,
  catalog: { select: inventoryMovementCatalogSelect },
  createdBy: { select: inventoryMovementUserSelect },
} satisfies Prisma.StockMovementSelect;

export const stockMovementSortableFields = ['createdAt'] as const;

export type TInventoryCatalog = Prisma.CatalogGetPayload<{
  select: typeof inventoryCatalogSelect;
}>;
export type TStockMovement = Prisma.StockMovementGetPayload<{
  select: typeof stockMovementSelect;
}>;
