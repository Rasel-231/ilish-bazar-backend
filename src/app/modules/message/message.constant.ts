import { Prisma } from '@prisma/client';

export const messageSearchableFields: string[] = ['content'];

export const messageSortableFields = ['createdAt', 'updatedAt', 'isRead'] as const;

export const messageUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const messageSelect = {
  id: true,
  content: true,
  senderId: true,
  receiverId: true,
  parentId: true,
  isRead: true,
  createdAt: true,
  updatedAt: true,
  sender: { select: messageUserSelect },
  receiver: { select: messageUserSelect },
} satisfies Prisma.MessageSelect;

export type TMessageUser = Prisma.UserGetPayload<{ select: typeof messageUserSelect }>;
export type TMessage = Prisma.MessageGetPayload<{ select: typeof messageSelect }>;
