import { z } from 'zod';

import { reviewValidation } from './review.validation';

export type { TReview, TReviewCatalog, TReviewUser } from './review.constant';

export type TCreateReviewPayload = z.infer<
  typeof reviewValidation.createReviewSchema
>['body'];
export type TUpdateReviewPayload = z.infer<
  typeof reviewValidation.updateReviewSchema
>['body'];
export type TUpdateReviewApprovalPayload = z.infer<
  typeof reviewValidation.updateReviewApprovalSchema
>['body'];
export type TReviewFilters = z.infer<typeof reviewValidation.listReviewsSchema>['query'];
export type TReviewIdParam = z.infer<typeof reviewValidation.idParamSchema>['params'];
