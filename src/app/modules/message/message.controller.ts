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
  TCreateMessagePayload,
  TMessageFilters,
  TMessageIdParam,
  TUpdateMessagePayload,
} from './message.interface';
import { MessageService } from './message.service';

const createMessage = catchAsync(async (req: TRequest<TCreateMessagePayload>, res) => {
  const result = await MessageService.createMessage(getAuthenticatedUser(req), req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Message created successfully!',
    data: result,
  });
});

const getAllMessages = catchAsync(async (req: TQueryRequest<TMessageFilters>, res) => {
  const { meta, data } = await MessageService.getAllMessages(
    getAuthenticatedUser(req),
    req.query,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages retrieved successfully!',
    meta,
    data,
  });
});

const getMessageById = catchAsync(
  async (req: TParamsRequest<TMessageIdParam>, res) => {
    const result = await MessageService.getMessageById(
      getAuthenticatedUser(req),
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Message retrieved successfully!',
      data: result,
    });
  },
);

const markMessageAsRead = catchAsync(
  async (req: TParamsRequest<TMessageIdParam>, res) => {
    const result = await MessageService.markMessageAsRead(
      getAuthenticatedUser(req),
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Message marked as read successfully!',
      data: result,
    });
  },
);

const updateMessage = catchAsync(
  async (req: TBodyParamsRequest<TUpdateMessagePayload, TMessageIdParam>, res) => {
    const result = await MessageService.updateMessage(
      getAuthenticatedUser(req),
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Message updated successfully!',
      data: result,
    });
  },
);

const deleteMessage = catchAsync(
  async (req: TParamsRequest<TMessageIdParam>, res) => {
    const result = await MessageService.deleteMessage(
      getAuthenticatedUser(req),
      req.params.id,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Message deleted successfully!',
      data: result,
    });
  },
);

export const MessageController = {
  createMessage,
  getAllMessages,
  getMessageById,
  markMessageAsRead,
  updateMessage,
  deleteMessage,
};
