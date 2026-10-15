import { Prisma } from '@prisma/client';

export const paymentSearchableFields: string[] = ['transactionId'];

export const paymentSortableFields = [
  'createdAt',
  'updatedAt',
  'amount',
  'status',
] as const;

export const paymentSelect = {
  id: true,
  orderId: true,
  userId: true,
  amount: true,
  method: true,
  status: true,
  transactionId: true,
  gatewayResponse: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentSelect;

export type TPayment = Prisma.PaymentGetPayload<{ select: typeof paymentSelect }>;
