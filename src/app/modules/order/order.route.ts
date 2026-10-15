import express from 'express';

import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { OrderController } from './order.controller';
import { orderValidation } from './order.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(orderValidation.createOrderSchema),
  OrderController.createOrder,
);

router.get(
  '/',
  auth(),
  validateRequest(orderValidation.listOrdersSchema),
  OrderController.getAllOrders,
);

router.get(
  '/:id',
  auth(),
  validateRequest(orderValidation.idParamSchema),
  OrderController.getOrderById,
);

router.post(
  '/:id/cancel',
  auth(),
  validateRequest(orderValidation.idParamSchema),
  OrderController.cancelOrder,
);

router.patch(
  '/:id/status',
  auth('ADMIN'),
  validateRequest(orderValidation.idParamSchema),
  validateRequest(orderValidation.updateOrderStatusSchema),
  OrderController.updateOrderStatus,
);

export const OrderRoutes = router;
