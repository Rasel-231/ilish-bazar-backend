import { z } from 'zod';

import { paymentValidation } from './payment.validation';

export type { TPayment } from './payment.constant';

export type TCreatePaymentPayload = z.infer<
  typeof paymentValidation.createPaymentSchema
>['body'];
export type TConfirmPaymentPayload = z.infer<
  typeof paymentValidation.confirmPaymentSchema
>['body'];
export type TPaymentFilters = z.infer<typeof paymentValidation.listPaymentsSchema>['query'];
export type TPaymentIdParam = z.infer<typeof paymentValidation.idParamSchema>['params'];
