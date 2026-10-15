import express from 'express';

import { auth, optionalAuth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { reviewValidation } from './review.validation';

const router = express.Router();

router.post(
  '/',
  optionalAuth,
  validateRequest(reviewValidation.createReviewSchema),
  ReviewController.createReview,
);

router.get(
  '/',
  optionalAuth,
  validateRequest(reviewValidation.listReviewsSchema),
  ReviewController.getAllReviews,
);

router.get(
  '/:id',
  optionalAuth,
  validateRequest(reviewValidation.idParamSchema),
  ReviewController.getReviewById,
);

router.patch(
  '/:id/approval',
  auth('ADMIN'),
  validateRequest(reviewValidation.idParamSchema),
  validateRequest(reviewValidation.updateReviewApprovalSchema),
  ReviewController.updateReviewApproval,
);

router.patch(
  '/:id',
  auth(),
  validateRequest(reviewValidation.idParamSchema),
  validateRequest(reviewValidation.updateReviewSchema),
  ReviewController.updateReview,
);

router.delete(
  '/:id',
  auth(),
  validateRequest(reviewValidation.idParamSchema),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
