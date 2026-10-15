import { z } from 'zod';

import { wishlistValidation } from './wishlist.validation';

export type {
  TWishlist,
  TWishlistCatalog,
  TWishlistItem,
} from './wishlist.constant';

export type TAddWishlistItemPayload = z.infer<
  typeof wishlistValidation.addWishlistItemSchema
>['body'];
export type TWishlistItemIdParam = z.infer<
  typeof wishlistValidation.itemIdParamSchema
>['params'];
