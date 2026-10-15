import { UserRole } from '@prisma/client';
import { z } from 'zod';

const booleanFromString = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value) => value === 'true'),
]);

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(6).max(100);
const nameSchema = z.string().trim().min(1).max(100);
const roleSchema = z.nativeEnum(UserRole);
const sortableFields = ['createdAt', 'updatedAt', 'email', 'name', 'role'] as const;
const sortOrders = ['asc', 'desc'] as const;

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user id!'),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
    role: roleSchema.optional(),
    isActive: booleanFromString.optional(),
  }),
});

const registerUserSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    name: nameSchema.optional(),
    role: roleSchema.optional(),
    isActive: booleanFromString.optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    name: nameSchema.optional(),
  }),
});

const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(sortableFields).optional(),
    sortOrder: z.enum(sortOrders).optional(),
    searchTerm: z.string().trim().min(1).max(100).optional(),
    email: emailSchema.optional(),
    role: roleSchema.optional(),
    isActive: booleanFromString.optional(),
  }),
});

export const userValidation = {
  idParamSchema,
  createUserSchema,
  registerUserSchema,
  updateUserSchema,
  updateProfileSchema,
  listUsersSchema,
};
