import { z } from 'zod';

import { catalogValidation } from './catalog.validation';

export type { TCatalog } from './catalog.constant';

export type TCreateCatalogPayload = z.infer<
  typeof catalogValidation.createCatalogSchema
>['body'];
export type TUpdateCatalogPayload = z.infer<
  typeof catalogValidation.updateCatalogSchema
>['body'];
export type TCatalogFilters = z.infer<typeof catalogValidation.listCatalogsSchema>['query'];
export type TCatalogIdParam = z.infer<typeof catalogValidation.idParamSchema>['params'];
