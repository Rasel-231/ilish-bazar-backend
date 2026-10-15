import { z } from 'zod';

const booleanFromString = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value) => value === 'true'),
]);

const sortableFields = ['createdAt', 'updatedAt', 'rating'] as const;
const sortOrders = ['asc', 'desc'] as const;

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review id!'),
  }),
});

const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product id!'),
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().trim().max(150).optional(),
    comment: z.string().trim().max(2000).optional(),
    guestName: z.string().trim().min(1).max(100).optional(),
    guestEmail: z.string().trim().email('Invalid email address!').optional(),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    title: z.string().trim().max(150).optional(),
    comment: z.string().trim().max(2000).optional(),
  }),
});

const updateReviewApprovalSchema = z.object({
  body: z.object({
    isApproved: booleanFromString,
  }),
});

const listReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(sortableFields).optional(),
    sortOrder: z.enum(sortOrders).optional(),
    searchTerm: z.string().trim().min(1).max(150).optional(),
    productId: z.string().uuid('Invalid product id!').optional(),
    userId: z.string().uuid('Invalid user id!').optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    isApproved: booleanFromString.optional(),
  }),
});

export const reviewValidation = {
  idParamSchema,
  createReviewSchema,
  updateReviewSchema,
  updateReviewApprovalSchema,
  listReviewsSchema,
};
