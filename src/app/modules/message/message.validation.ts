import { z } from 'zod';

const booleanFromString = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value) => value === 'true'),
]);

const contentSchema = z.string().trim().min(1).max(2000);
const sortableFields = ['createdAt', 'updatedAt', 'isRead'] as const;
const sortOrders = ['asc', 'desc'] as const;

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid message id!'),
  }),
});

const createMessageSchema = z.object({
  body: z.object({
    content: contentSchema,
    receiverId: z.string().uuid('Invalid receiver id!').optional(),
    parentId: z.string().uuid('Invalid parent message id!').optional(),
  }),
});

const updateMessageSchema = z.object({
  body: z.object({
    content: contentSchema.optional(),
    isRead: booleanFromString.optional(),
  }),
});

const listMessagesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(sortableFields).optional(),
    sortOrder: z.enum(sortOrders).optional(),
    searchTerm: z.string().trim().min(1).max(200).optional(),
    senderId: z.string().uuid('Invalid sender id!').optional(),
    receiverId: z.string().uuid('Invalid receiver id!').optional(),
    parentId: z.string().uuid('Invalid parent message id!').optional(),
    isRead: booleanFromString.optional(),
  }),
});

export const messageValidation = {
  idParamSchema,
  createMessageSchema,
  updateMessageSchema,
  listMessagesSchema,
};
