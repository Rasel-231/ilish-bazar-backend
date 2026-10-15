import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../shared/paginationHelper';
import type {
  IAuthenticatedUser,
  IGenericResponse,
  IPaginationOptions,
  TPaymentStatus,
} from '../../../types';
import { paymentSelect, paymentSortableFields, type TPayment } from './payment.constant';
import type {
  TConfirmPaymentPayload,
  TCreatePaymentPayload,
  TPaymentFilters,
} from './payment.interface';

const isAdmin = (user: IAuthenticatedUser): boolean => user.role === 'ADMIN';

const isSortableField = (value: string): value is (typeof paymentSortableFields)[number] =>
  (paymentSortableFields as readonly string[]).includes(value);

const buildAccessScope = (user: IAuthenticatedUser): Prisma.PaymentWhereInput =>
  isAdmin(user) ? {} : { userId: user.id };

const buildPaymentWhereInput = (
  filters: TPaymentFilters,
  user: IAuthenticatedUser,
): Prisma.PaymentWhereInput => {
  const { status, method, orderId, userId } = filters;
  const andConditions: Prisma.PaymentWhereInput[] = [];

  const accessScope = buildAccessScope(user);

  if (Object.keys(accessScope).length > 0) {
    andConditions.push(accessScope);
  }

  if (status) {
    andConditions.push({ status });
  }

  if (method) {
    andConditions.push({ method });
  }

  if (orderId) {
    andConditions.push({ orderId });
  }

  if (userId) {
    andConditions.push({ userId });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const resolveOrderBy = (
  sortBy: string,
  sortOrder: Prisma.SortOrder,
): Prisma.PaymentOrderByWithRelationInput => {
  const field = isSortableField(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder };
};

const createPayment = async (
  user: IAuthenticatedUser,
  payload: TCreatePaymentPayload,
): Promise<TPayment> =>
  prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: payload.orderId, userId: user.id },
      select: { id: true, totalAmount: true, status: true, paymentStatus: true },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');
    }

    if (order.status === 'CANCELLED') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot pay for a cancelled order!');
    }

    if (order.paymentStatus === 'PAID') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'This order has already been paid!');
    }

    const existingPending = await tx.payment.findFirst({
      where: { orderId: order.id, status: 'PENDING' },
      select: { id: true },
    });

    if (existingPending) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'A pending payment already exists for this order!',
      );
    }

    return tx.payment.create({
      data: {
        orderId: order.id,
        userId: user.id,
        amount: order.totalAmount,
        method: payload.method,
        status: 'PENDING',
      },
      select: paymentSelect,
    });
  });

const getAllPayments = async (
  user: IAuthenticatedUser,
  filters: TPaymentFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<TPayment[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const where = buildPaymentWhereInput(filters, user);
  const orderBy = resolveOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([
    prisma.payment.findMany({ where, skip, take: limit, orderBy, select: paymentSelect }),
    prisma.payment.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getPaymentById = async (user: IAuthenticatedUser, id: string): Promise<TPayment> => {
  const payment = await prisma.payment.findFirst({
    where: { AND: [{ id }, buildAccessScope(user)] },
    select: paymentSelect,
  });

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found!');
  }

  return payment;
};

const ensurePaymentTransition = (
  currentStatus: TPaymentStatus,
  forbiddenStatuses: TPaymentStatus[],
  message: string,
): void => {
  if (forbiddenStatuses.includes(currentStatus)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, message);
  }
};

const confirmPayment = async (
  user: IAuthenticatedUser,
  id: string,
  payload: TConfirmPaymentPayload,
): Promise<TPayment> =>
  prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id },
      select: { id: true, orderId: true, userId: true, status: true },
    });

    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found!');
    }

    if (!isAdmin(user) && payment.userId !== user.id) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to confirm this payment!',
      );
    }

    ensurePaymentTransition(payment.status, ['PAID'], 'Payment is already completed!');
    ensurePaymentTransition(
      payment.status,
      ['REFUNDED'],
      'Refunded payments cannot be confirmed!',
    );

    const updatedPayment = await tx.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        ...(payload.transactionId && { transactionId: payload.transactionId }),
        ...(payload.gatewayResponse !== undefined && {
          gatewayResponse: payload.gatewayResponse as Prisma.InputJsonValue,
        }),
      },
      select: paymentSelect,
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    });

    return updatedPayment;
  });

const failPayment = async (user: IAuthenticatedUser, id: string): Promise<TPayment> =>
  prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id },
      select: { id: true, orderId: true, userId: true, status: true },
    });

    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found!');
    }

    if (!isAdmin(user) && payment.userId !== user.id) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to update this payment!',
      );
    }

    ensurePaymentTransition(
      payment.status,
      ['PAID', 'REFUNDED'],
      'Completed payments cannot be marked as failed!',
    );

    const updatedPayment = await tx.payment.update({
      where: { id },
      data: { status: 'FAILED' },
      select: paymentSelect,
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'FAILED' },
    });

    return updatedPayment;
  });

const refundPayment = async (user: IAuthenticatedUser, id: string): Promise<TPayment> =>
  prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id },
      select: { id: true, orderId: true, status: true },
    });

    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found!');
    }

    if (!isAdmin(user)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only administrators can refund payments!');
    }

    ensurePaymentTransition(payment.status, ['REFUNDED'], 'Payment is already refunded!');
    ensurePaymentTransition(
      payment.status,
      ['PENDING'],
      'Only completed payments can be refunded!',
    );

    const updatedPayment = await tx.payment.update({
      where: { id },
      data: { status: 'REFUNDED' },
      select: paymentSelect,
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'REFUNDED', status: 'CANCELLED' },
    });

    return updatedPayment;
  });

export const PaymentService = {
  createPayment,
  getAllPayments,
  getPaymentById,
  confirmPayment,
  failPayment,
  refundPayment,
};
