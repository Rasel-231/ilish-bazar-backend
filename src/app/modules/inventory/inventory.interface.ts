import { z } from 'zod';

import { inventoryValidation } from './inventory.validation';

export type { TInventoryCatalog, TStockMovement } from './inventory.constant';

export type TAdjustStockPayload = z.infer<
  typeof inventoryValidation.adjustStockSchema
>['body'];
export type TMovementFilters = z.infer<
  typeof inventoryValidation.listMovementsSchema
>['query'];
export type TLowStockQuery = z.infer<
  typeof inventoryValidation.listLowStockSchema
>['query'];
export type TStockSummaryQuery = z.infer<
  typeof inventoryValidation.getStockSummarySchema
>['query'];
