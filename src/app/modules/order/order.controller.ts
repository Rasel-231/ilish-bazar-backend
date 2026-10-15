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
  TCreateOrderPayload,
  TOrderFilters,
  TOrderIdParam,
  TUpdateOrderStatusPayload,
} from './order.interface';
import { OrderService } from './order.service';

const createOrder = catchAsync(async (req: TRequest<TCreateOrderPayload>, res) => {
  const result = await OrderService.createOrder(getAuthenticatedUser(req), req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order created successfully!',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: TQueryRequest<TOrderFilters>, res) => {
  const { meta, data } = await OrderService.getAllOrders(
    getAuthenticatedUser(req),
    req.query,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders retrieved successfully!',
    meta,
    data,
  });
});

const getOrderById = catchAsync(
  async (req: TParamsRequest<TOrderIdParam>, res) => {
    const result = await OrderService.getOrderById(getAuthenticatedUser(req), req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Order retrieved successfully!',
      data: result,
    });
  },
);

const updateOrderStatus = catchAsync(
  async (req: TBodyParamsRequest<TUpdateOrderStatusPayload, TOrderIdParam>, res) => {
    const result = await OrderService.updateOrderStatus(req.params.id, req.body.status);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Order status updated successfully!',
      data: result,
    });
  },
);

const cancelOrder = catchAsync(
  async (req: TParamsRequest<TOrderIdParam>, res) => {
    const result = await OrderService.cancelOrder(getAuthenticatedUser(req), req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Order cancelled successfully!',
      data: result,
    });
  },
);

export const OrderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
