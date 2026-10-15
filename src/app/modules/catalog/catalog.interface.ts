import { z } from 'zod';

import { productValidation } from './product.validation';

export type { TProduct } from './product.constant';

export type TCreateProductPayload = z.infer<
  typeof productValidation.createProductSchema
>['body'];
export type TUpdateProductPayload = z.infer<
  typeof productValidation.updateProductSchema
>['body'];
export type TProductFilters = z.infer<typeof productValidation.listProductsSchema>['query'];
export type TProductIdParam = z.infer<typeof productValidation.idParamSchema>['params'];
