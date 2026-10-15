import { Prisma } from '@prisma/client';

export const reviewSearchableFields: string[] = ['title', 'comment', 'guestName'];

export const reviewSortableFields = ['createdAt', 'updatedAt', 'rating'] as const;

export const reviewCatalogSelect = {
  id: true,
  name: true,
  imageUrl: true,
} satisfies Prisma.CatalogSelect;

export const reviewUserSelect = {
  id: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const reviewSelect = {
  id: true,
  productId: true,
  userId: true,
  guestName: true,
  guestEmail: true,
  rating: true,
  title: true,
  comment: true,
  isApproved: true,
  createdAt: true,
  updatedAt: true,
  catalog: { select: reviewCatalogSelect },
  user: { select: reviewUserSelect },
} satisfies Prisma.ReviewSelect;

export type TReviewCatalog = Prisma.CatalogGetPayload<{
  select: typeof reviewCatalogSelect;
}>;
export type TReviewUser = Prisma.UserGetPayload<{ select: typeof reviewUserSelect }>;
export type TReview = Prisma.ReviewGetPayload<{ select: typeof reviewSelect }>;
