import { StatusCodes } from 'http-status-codes';

import type { TBodyParamsRequest, TParamsRequest, TRequest } from '../../../types';
import { catchAsync } from '../../../utils/catchAsync';
import { getAuthenticatedUser } from '../../../utils/requestHelper';
import { sendResponse } from '../../../utils/sendResponse';
import type {
  TAddCartItemPayload,
  TCartItemIdParam,
  TUpdateCartItemPayload,
} from './cart.interface';
import { CartService } from './cart.service';

const getMyCart = catchAsync(async (req: TRequest, res) => {
  const result = await CartService.getMyCart(getAuthenticatedUser(req));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart retrieved successfully!',
    data: result,
  });
});

const addCartItem = catchAsync(async (req: TRequest<TAddCartItemPayload>, res) => {
  const result = await CartService.addCartItem(getAuthenticatedUser(req), req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart item added successfully!',
    data: result,
  });
});

const updateCartItem = catchAsync(
  async (req: TBodyParamsRequest<TUpdateCartItemPayload, TCartItemIdParam>, res) => {
    const result = await CartService.updateCartItem(
      getAuthenticatedUser(req),
      req.params.itemId,
      req.body.quantity,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Cart item updated successfully!',
      data: result,
    });
  },
);

const removeCartItem = catchAsync(
  async (req: TParamsRequest<TCartItemIdParam>, res) => {
    const result = await CartService.removeCartItem(
      getAuthenticatedUser(req),
      req.params.itemId,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Cart item removed successfully!',
      data: result,
    });
  },
);

const clearCart = catchAsync(async (req: TRequest, res) => {
  const result = await CartService.clearCart(getAuthenticatedUser(req));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart cleared successfully!',
    data: result,
  });
});

export const CartController = {
  getMyCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
