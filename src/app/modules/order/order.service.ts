import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../shared/paginationHelper';
import type {
  IAuthenticatedUser,
  IGenericResponse,
  IPaginationOptions,
  TOrderStatus,
} from '../../../types';
import {
  orderSearchableFields,
  orderSelect,
  orderSortableFields,
  type TOrder,
} from './order.constant';
import type { TCreateOrderPayload, TOrderFilters } from './order.interface';

const isAdmin = (user: IAuthenticatedUser): boolean => user.role === 'ADMIN';

const isSortableField = (value: string): value is (typeof orderSortableFields)[number] =>
  (orderSortableFields as readonly string[]).includes(value);

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `ORD-${timestamp}-${random}`;
};

const buildAccessScope = (user: IAuthenticatedUser): Prisma.OrderWhereInput =>
  isAdmin(user) ? {} : { userId: user.id };

const buildOrderWhereInput = (
  filters: TOrderFilters,
  user: IAuthenticatedUser,
): Prisma.OrderWhereInput => {
  const { searchTerm, status, paymentStatus, userId } = filters;
  const andConditions: Prisma.OrderWhereInput[] = [];

  const accessScope = buildAccessScope(user);

  if (Object.keys(accessScope).length > 0) {
    andConditions.push(accessScope);
  }

  if (searchTerm) {
    andConditions.push({
      OR: orderSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (status) {
    andConditions.push({ status });
  }

  if (paymentStatus) {
    andConditions.push({ paymentStatus });
  }

  if (userId) {
    andConditions.push({ userId });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const resolveOrderBy = (
  sortBy: string,
  sortOrder: Prisma.SortOrder,
): Prisma.OrderOrderByWithRelationInput => {
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
};

const findAccessibleOrder = async (
  user: IAuthenticatedUser,
  id: string,
): Promise<TOrder> => {
  const order = await prisma.order.findFirst({
    where: { AND: [{ id }, buildAccessScope(user)] },
    select: orderSelect,
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');
  }

  return order;
};

const createOrder = async (
  user: IAuthenticatedUser,
  payload: TCreateOrderPayload,
): Promise<TOrder> =>
  prisma.$transaction(async (tx) => {
    // Aggregate quantities so duplicated product lines are validated together.
    const quantityByProduct = new Map<string, number>();

    for (const item of payload.items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const productIds = [...quantityByProduct.keys()];

    const products = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true, name: true, price: true },
    });

    if (products.length !== productIds.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'One or more products are unavailable!');
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    let subtotal = new Prisma.Decimal(0);
    const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const [productId, quantity] of quantityByProduct) {
      const product = productMap.get(productId)!;

      // Atomic, race-safe stock decrement guarded by the >= quantity condition.
      const decremented = await tx.product.updateMany({
        where: { id: productId, isActive: true, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });

      if (decremented.count === 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Insufficient stock for "${product.name}"!`,
        );
      }

      const unitPrice = product.price;
      const lineTotal = unitPrice.mul(quantity);
      subtotal = subtotal.add(lineTotal);

      itemsData.push({
        product: { connect: { id: productId } },
        productName: product.name,
        unitPrice,
        quantity,
        lineTotal,
      });
    }

    const shippingFee = new Prisma.Decimal(payload.shippingFee ?? 0);
    const totalAmount = subtotal.add(shippingFee);

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        user: { connect: { id: user.id } },
        subtotal,
        shippingFee,
        totalAmount,
        shippingAddress: payload.shippingAddress,
        phone: payload.phone,
        ...(payload.note && { note: payload.note }),
        items: { create: itemsData },
      },
      select: orderSelect,
    });
  });

const getAllOrders = async (
  user: IAuthenticatedUser,
  filters: TOrderFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<TOrder[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const where = buildOrderWhereInput(filters, user);
  const orderBy = resolveOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take: limit, orderBy, select: orderSelect }),
    prisma.order.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getOrderById = async (user: IAuthenticatedUser, id: string): Promise<TOrder> =>
  findAccessibleOrder(user, id);

const updateOrderStatus = async (id: string, status: TOrderStatus): Promise<TOrder> => {
  const existing = await prisma.order.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');
  }

  return prisma.order.update({ where: { id }, data: { status }, select: orderSelect });
};

const cancelOrder = async (user: IAuthenticatedUser, id: string): Promise<TOrder> =>
  prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        items: { select: { productId: true, quantity: true } },
      },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');
    }

    if (!isAdmin(user) && order.userId !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to cancel this order!');
    }

    if (order.status === 'CANCELLED') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Order is already cancelled!');
    }

    if (order.status === 'DELIVERED') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delivered orders cannot be cancelled!');
    }

    // Restore reserved stock atomically together with the status change.
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return tx.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      select: orderSelect,
    });
  });

export const OrderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
