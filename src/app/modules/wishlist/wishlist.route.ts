import express from 'express';

import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { WishlistController } from './wishlist.controller';
import { wishlistValidation } from './wishlist.validation';

const router = express.Router();

router.get('/', auth(), WishlistController.getMyWishlist);

router.post(
  '/items',
  auth(),
  validateRequest(wishlistValidation.addWishlistItemSchema),
  WishlistController.addWishlistItem,
);

router.delete(
  '/items/:itemId',
  auth(),
  validateRequest(wishlistValidation.itemIdParamSchema),
  WishlistController.removeWishlistItem,
);

router.delete('/', auth(), WishlistController.clearWishlist);

export const WishlistRoutes = router;
