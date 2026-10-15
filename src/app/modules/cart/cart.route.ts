import express from 'express';

import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { CartController } from './cart.controller';
import { cartValidation } from './cart.validation';

const router = express.Router();

router.get('/', auth(), CartController.getMyCart);

router.post(
  '/items',
  auth(),
  validateRequest(cartValidation.addCartItemSchema),
  CartController.addCartItem,
);

router.patch(
  '/items/:itemId',
  auth(),
  validateRequest(cartValidation.itemIdParamSchema),
  validateRequest(cartValidation.updateCartItemSchema),
  CartController.updateCartItem,
);

router.delete(
  '/items/:itemId',
  auth(),
  validateRequest(cartValidation.itemIdParamSchema),
  CartController.removeCartItem,
);

router.delete('/', auth(), CartController.clearCart);

export const CartRoutes = router;
