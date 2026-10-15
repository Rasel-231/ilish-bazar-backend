import { StatusCodes } from 'http-status-codes';

import type {
  TBodyParamsRequest,
  TParamsRequest,
  TQueryRequest,
  TRequest,
} from '../../../types';
import { catchAsync } from '../../../utils/catchAsync';
import { getAuthenticatedUser } from '../../../utils/requestHelper';
import { sendResponse } from '../../../utils/sendResponse';
import type {
  TCreateReviewPayload,
  TReviewFilters,
  TReviewIdParam,
  TUpdateReviewApprovalPayload,
  TUpdateReviewPayload,
} from './review.interface';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req: TRequest<TCreateReviewPayload>, res) => {
  const result = await ReviewService.createReview(req.user, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review created successfully!',
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: TQueryRequest<TReviewFilters>, res) => {
  const { meta, data } = await ReviewService.getAllReviews(req.user, req.query, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews retrieved successfully!',
    meta,
    data,
  });
});

const getReviewById = catchAsync(
  async (req: TParamsRequest<TReviewIdParam>, res) => {
    const result = await ReviewService.getReviewById(req.user, req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Review retrieved successfully!',
      data: result,
    });
  },
);

const updateReview = catchAsync(
  async (req: TBodyParamsRequest<TUpdateReviewPayload, TReviewIdParam>, res) => {
    const result = await ReviewService.updateReview(
      getAuthenticatedUser(req),
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Review updated successfully!',
      data: result,
    });
  },
);

const updateReviewApproval = catchAsync(
  async (req: TBodyParamsRequest<TUpdateReviewApprovalPayload, TReviewIdParam>, res) => {
    const result = await ReviewService.updateReviewApproval(
      req.params.id,
      req.body.isApproved,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Review approval updated successfully!',
      data: result,
    });
  },
);

const deleteReview = catchAsync(
  async (req: TParamsRequest<TReviewIdParam>, res) => {
    const result = await ReviewService.deleteReview(
      getAuthenticatedUser(req),
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Review deleted successfully!',
      data: result,
    });
  },
);

export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  updateReviewApproval,
  deleteReview,
};
