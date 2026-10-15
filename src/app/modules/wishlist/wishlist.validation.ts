import { z } from 'zod';

const itemIdParamSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid wishlist item id!'),
  }),
});

const addWishlistItemSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product id!'),
  }),
});

export const wishlistValidation = {
  itemIdParamSchema,
  addWishlistItemSchema,
};
