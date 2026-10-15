import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const paymentMethodSchema = z.nativeEnum(PaymentMethod);
const paymentStatusSchema = z.nativeEnum(PaymentStatus);
const sortableFields = ['createdAt', 'updatedAt', 'amount', 'status'] as const;
const sortOrders = ['asc', 'desc'] as const;

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment id!'),
  }),
});

const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order id!'),
    method: paymentMethodSchema,
  }),
});

const confirmPaymentSchema = z.object({
  body: z.object({
    transactionId: z.string().trim().min(1).max(150).optional(),
    gatewayResponse: z.unknown().optional(),
  }),
});

const listPaymentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(sortableFields).optional(),
    sortOrder: z.enum(sortOrders).optional(),
    status: paymentStatusSchema.optional(),
    method: paymentMethodSchema.optional(),
    orderId: z.string().uuid('Invalid order id!').optional(),
    userId: z.string().uuid('Invalid user id!').optional(),
  }),
});

export const paymentValidation = {
  idParamSchema,
  createPaymentSchema,
  confirmPaymentSchema,
  listPaymentsSchema,
};
