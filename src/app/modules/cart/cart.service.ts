import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import type { IAuthenticatedUser } from '../../../types';
import { cartItemSelect, cartSelect, type TCart } from './cart.constant';
import type { TAddCartItemPayload } from './cart.interface';

const getOrCreateCart = async (userId: string): Promise<TCart> =>
  prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: cartSelect,
  });

const ensureAvailableCatalog = async (id: string): Promise<void> => {
  const catalog = await prisma.catalog.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });

  if (!catalog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Catalog not found!');
  }

  if (!catalog.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Catalog item is not available!');
  }
};

const getMyCart = async (user: IAuthenticatedUser): Promise<TCart> =>
  getOrCreateCart(user.id);

const addCartItem = async (
  user: IAuthenticatedUser,
  payload: TAddCartItemPayload,
): Promise<TCart> => {
  await ensureAvailableCatalog(payload.productId);

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  });

  const quantity = payload.quantity ?? 1;

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: payload.productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId: payload.productId, quantity },
    select: cartItemSelect,
  });

  return getOrCreateCart(user.id);
};

const updateCartItem = async (
  user: IAuthenticatedUser,
  itemId: string,
  quantity: number,
): Promise<TCart> => {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId: user.id } },
    select: { id: true },
  });

  if (!item) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found!');
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    select: cartItemSelect,
  });

  return getOrCreateCart(user.id);
};

const removeCartItem = async (
  user: IAuthenticatedUser,
  itemId: string,
): Promise<TCart> => {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId: user.id } },
    select: { id: true },
  });

  if (!item) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found!');
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return getOrCreateCart(user.id);
};

const clearCart = async (user: IAuthenticatedUser): Promise<TCart> => {
  await prisma.cartItem.deleteMany({ where: { cart: { userId: user.id } } });

  return getOrCreateCart(user.id);
};

export const CartService = {
  getMyCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
