import { StatusCodes } from 'http-status-codes';

import type { TParamsRequest, TRequest } from '../../../types';
import { catchAsync } from '../../../utils/catchAsync';
import { getAuthenticatedUser } from '../../../utils/requestHelper';
import { sendResponse } from '../../../utils/sendResponse';
import type {
  TAddWishlistItemPayload,
  TWishlistItemIdParam,
} from './wishlist.interface';
import { WishlistService } from './wishlist.service';

const getMyWishlist = catchAsync(async (req: TRequest, res) => {
  const result = await WishlistService.getMyWishlist(getAuthenticatedUser(req));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wishlist retrieved successfully!',
    data: result,
  });
});

const addWishlistItem = catchAsync(
  async (req: TRequest<TAddWishlistItemPayload>, res) => {
    const result = await WishlistService.addWishlistItem(
      getAuthenticatedUser(req),
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Wishlist item added successfully!',
      data: result,
    });
  },
);

const removeWishlistItem = catchAsync(
  async (req: TParamsRequest<TWishlistItemIdParam>, res) => {
    const result = await WishlistService.removeWishlistItem(
      getAuthenticatedUser(req),
      req.params.itemId,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Wishlist item removed successfully!',
      data: result,
    });
  },
);

const clearWishlist = catchAsync(async (req: TRequest, res) => {
  const result = await WishlistService.clearWishlist(getAuthenticatedUser(req));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wishlist cleared successfully!',
    data: result,
  });
});

export const WishlistController = {
  getMyWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
};
