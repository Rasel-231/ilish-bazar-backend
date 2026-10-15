import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductUnit,
  UserRole,
} from '@prisma/client';

export { OrderStatus, PaymentMethod, PaymentStatus, ProductUnit, UserRole };

export type TUserRole = UserRole;
export type TOrderStatus = OrderStatus;
export type TPaymentStatus = PaymentStatus;
export type TPaymentMethod = PaymentMethod;
export type TProductUnit = ProductUnit;
