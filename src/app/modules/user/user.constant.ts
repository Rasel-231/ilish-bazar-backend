import { Prisma } from '@prisma/client';

export const userSearchableFields: string[] = ['email', 'name'];

export const userSortableFields = [
  'createdAt',
  'updatedAt',
  'email',
  'name',
  'role',
] as const;

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type TPublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;
