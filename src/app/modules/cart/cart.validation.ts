import { z } from 'zod';

const itemIdParamSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid cart item id!'),
  }),
});

const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product id!'),
    quantity: z.coerce.number().int().positive().max(100).optional(),
  }),
});

const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().positive().max(100),
  }),
});

export const cartValidation = {
  itemIdParamSchema,
  addCartItemSchema,
  updateCartItemSchema,
};
