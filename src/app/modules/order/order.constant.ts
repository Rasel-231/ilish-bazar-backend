import { Prisma } from '@prisma/client';

export const orderSearchableFields: string[] = [
  'orderNumber',
  'phone',
  'shippingAddress',
];

export const orderSortableFields = [
  'createdAt',
  'updatedAt',
  'totalAmount',
  'status',
] as const;

export const orderUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const orderItemSelect = {
  id: true,
  orderId: true,
  productId: true,
  productName: true,
  unitPrice: true,
  quantity: true,
  lineTotal: true,
  createdAt: true,
} satisfies Prisma.OrderItemSelect;

export const orderSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  status: true,
  paymentStatus: true,
  subtotal: true,
  shippingFee: true,
  totalAmount: true,
  shippingAddress: true,
  phone: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  user: { select: orderUserSelect },
  items: { select: orderItemSelect },
} satisfies Prisma.OrderSelect;

export type TOrderUser = Prisma.UserGetPayload<{ select: typeof orderUserSelect }>;
export type TOrderItem = Prisma.OrderItemGetPayload<{ select: typeof orderItemSelect }>;
export type TOrder = Prisma.OrderGetPayload<{ select: typeof orderSelect }>;
