import { z } from 'zod';

import { cartValidation } from './cart.validation';

export type { TCart, TCartCatalog, TCartItem } from './cart.constant';

export type TAddCartItemPayload = z.infer<
  typeof cartValidation.addCartItemSchema
>['body'];
export type TUpdateCartItemPayload = z.infer<
  typeof cartValidation.updateCartItemSchema
>['body'];
export type TCartItemIdParam = z.infer<typeof cartValidation.itemIdParamSchema>['params'];
