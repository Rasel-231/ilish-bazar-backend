import express from 'express';

import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { InventoryController } from './inventory.controller';
import { inventoryValidation } from './inventory.validation';

const router = express.Router();

router.post(
  '/adjust',
  auth('ADMIN'),
  validateRequest(inventoryValidation.adjustStockSchema),
  InventoryController.adjustStock,
);

router.get(
  '/movements',
  auth('ADMIN'),
  validateRequest(inventoryValidation.listMovementsSchema),
  InventoryController.getAllMovements,
);

router.get(
  '/low-stock',
  auth('ADMIN'),
  validateRequest(inventoryValidation.listLowStockSchema),
  InventoryController.getLowStockCatalogs,
);

router.get(
  '/summary',
  auth('ADMIN'),
  validateRequest(inventoryValidation.getStockSummarySchema),
  InventoryController.getStockSummary,
);

export const InventoryRoutes = router;
