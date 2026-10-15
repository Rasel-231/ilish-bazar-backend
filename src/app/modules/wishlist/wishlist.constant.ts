import { Prisma } from '@prisma/client';

export const wishlistCatalogSelect = {
  id: true,
  name: true,
  price: true,
  imageUrl: true,
  stock: true,
  unit: true,
  isActive: true,
} satisfies Prisma.CatalogSelect;

export const wishlistItemSelect = {
  id: true,
  wishlistId: true,
  productId: true,
  createdAt: true,
  catalog: { select: wishlistCatalogSelect },
} satisfies Prisma.WishlistItemSelect;

export const wishlistSelect = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  items: { select: wishlistItemSelect },
} satisfies Prisma.WishlistSelect;

export type TWishlistCatalog = Prisma.CatalogGetPayload<{
  select: typeof wishlistCatalogSelect;
}>;
export type TWishlistItem = Prisma.WishlistItemGetPayload<{
  select: typeof wishlistItemSelect;
}>;
export type TWishlist = Prisma.WishlistGetPayload<{ select: typeof wishlistSelect }>;
