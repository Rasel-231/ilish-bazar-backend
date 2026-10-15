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
  TConfirmPaymentPayload,
  TCreatePaymentPayload,
  TPaymentFilters,
  TPaymentIdParam,
} from './payment.interface';
import { PaymentService } from './payment.service';

const createPayment = catchAsync(async (req: TRequest<TCreatePaymentPayload>, res) => {
  const result = await PaymentService.createPayment(getAuthenticatedUser(req), req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Payment initiated successfully!',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: TQueryRequest<TPaymentFilters>, res) => {
  const { meta, data } = await PaymentService.getAllPayments(
    getAuthenticatedUser(req),
    req.query,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payments retrieved successfully!',
    meta,
    data,
  });
});

const getPaymentById = catchAsync(
  async (req: TParamsRequest<TPaymentIdParam>, res) => {
    const result = await PaymentService.getPaymentById(
      getAuthenticatedUser(req),
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Payment retrieved successfully!',
      data: result,
    });
  },
);

const confirmPayment = catchAsync(
  async (req: TBodyParamsRequest<TConfirmPaymentPayload, TPaymentIdParam>, res) => {
    const result = await PaymentService.confirmPayment(
      getAuthenticatedUser(req),
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Payment confirmed successfully!',
      data: result,
    });
  },
);

const failPayment = catchAsync(
  async (req: TParamsRequest<TPaymentIdParam>, res) => {
    const result = await PaymentService.failPayment(
      getAuthenticatedUser(req),
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Payment marked as failed successfully!',
      data: result,
    });
  },
);

const refundPayment = catchAsync(
  async (req: TParamsRequest<TPaymentIdParam>, res) => {
    const result = await PaymentService.refundPayment(
      getAuthenticatedUser(req),
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Payment refunded successfully!',
      data: result,
    });
  },
);

export const PaymentController = {
  createPayment,
  getAllPayments,
  getPaymentById,
  confirmPayment,
  failPayment,
  refundPayment,
};
