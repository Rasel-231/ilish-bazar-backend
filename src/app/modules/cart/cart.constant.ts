import { Prisma } from '@prisma/client';

export const cartCatalogSelect = {
  id: true,
  name: true,
  price: true,
  imageUrl: true,
  stock: true,
  unit: true,
  isActive: true,
} satisfies Prisma.CatalogSelect;

export const cartItemSelect = {
  id: true,
  cartId: true,
  productId: true,
  quantity: true,
  createdAt: true,
  updatedAt: true,
  catalog: { select: cartCatalogSelect },
} satisfies Prisma.CartItemSelect;

export const cartSelect = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  items: { select: cartItemSelect },
} satisfies Prisma.CartSelect;

export type TCartCatalog = Prisma.CatalogGetPayload<{
  select: typeof cartCatalogSelect;
}>;
export type TCartItem = Prisma.CartItemGetPayload<{ select: typeof cartItemSelect }>;
export type TCart = Prisma.CartGetPayload<{ select: typeof cartSelect }>;
