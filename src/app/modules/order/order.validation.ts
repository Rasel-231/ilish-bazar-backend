import { OrderStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const orderStatusSchema = z.nativeEnum(OrderStatus);
const paymentStatusSchema = z.nativeEnum(PaymentStatus);
const sortableFields = ['createdAt', 'updatedAt', 'totalAmount', 'status'] as const;
const sortOrders = ['asc', 'desc'] as const;

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order id!'),
  }),
});

const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid('Invalid product id!'),
          quantity: z.coerce.number().int().positive(),
        }),
      )
      .min(1, 'At least one order item is required!'),
    shippingAddress: z.string().trim().min(1).max(500),
    phone: z.string().trim().min(1).max(30),
    note: z.string().trim().max(1000).optional(),
    shippingFee: z.coerce.number().nonnegative().optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: orderStatusSchema,
  }),
});

const listOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(sortableFields).optional(),
    sortOrder: z.enum(sortOrders).optional(),
    searchTerm: z.string().trim().min(1).max(150).optional(),
    status: orderStatusSchema.optional(),
    paymentStatus: paymentStatusSchema.optional(),
    userId: z.string().uuid('Invalid user id!').optional(),
  }),
});

export const orderValidation = {
  idParamSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersSchema,
};
