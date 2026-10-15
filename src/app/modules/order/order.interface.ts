import { z } from 'zod';

import { orderValidation } from './order.validation';

export type { TOrder, TOrderItem, TOrderUser } from './order.constant';

export type TCreateOrderPayload = z.infer<typeof orderValidation.createOrderSchema>['body'];
export type TUpdateOrderStatusPayload = z.infer<
  typeof orderValidation.updateOrderStatusSchema
>['body'];
export type TOrderFilters = z.infer<typeof orderValidation.listOrdersSchema>['query'];
export type TOrderIdParam = z.infer<typeof orderValidation.idParamSchema>['params'];
