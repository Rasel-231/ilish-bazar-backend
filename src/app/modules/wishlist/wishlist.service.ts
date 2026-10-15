import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import type { IAuthenticatedUser } from '../../../types';
import { wishlistSelect, type TWishlist } from './wishlist.constant';
import type { TAddWishlistItemPayload } from './wishlist.interface';

const getOrCreateWishlist = async (userId: string): Promise<TWishlist> =>
  prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: wishlistSelect,
  });

const ensureCatalogExists = async (id: string): Promise<void> => {
  const catalog = await prisma.catalog.findUnique({ where: { id }, select: { id: true } });

  if (!catalog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Catalog not found!');
  }
};

const getMyWishlist = async (user: IAuthenticatedUser): Promise<TWishlist> =>
  getOrCreateWishlist(user.id);

const addWishlistItem = async (
  user: IAuthenticatedUser,
  payload: TAddWishlistItemPayload,
): Promise<TWishlist> => {
  await ensureCatalogExists(payload.productId);

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  });

  await prisma.wishlistItem.upsert({
    where: {
      wishlistId_productId: { wishlistId: wishlist.id, productId: payload.productId },
    },
    update: {},
    create: { wishlistId: wishlist.id, productId: payload.productId },
  });

  return getOrCreateWishlist(user.id);
};

const removeWishlistItem = async (
  user: IAuthenticatedUser,
  itemId: string,
): Promise<TWishlist> => {
  const item = await prisma.wishlistItem.findFirst({
    where: { id: itemId, wishlist: { userId: user.id } },
    select: { id: true },
  });

  if (!item) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Wishlist item not found!');
  }

  await prisma.wishlistItem.delete({ where: { id: itemId } });

  return getOrCreateWishlist(user.id);
};

const clearWishlist = async (user: IAuthenticatedUser): Promise<TWishlist> => {
  await prisma.wishlistItem.deleteMany({ where: { wishlist: { userId: user.id } } });

  return getOrCreateWishlist(user.id);
};

export const WishlistService = {
  getMyWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
};
