import { StatusCodes } from 'http-status-codes';

import type { TQueryRequest, TRequest } from '../../../types';
import { catchAsync } from '../../../utils/catchAsync';
import { getAuthenticatedUser } from '../../../utils/requestHelper';
import { sendResponse } from '../../../utils/sendResponse';
import type {
  TAdjustStockPayload,
  TLowStockQuery,
  TMovementFilters,
  TStockSummaryQuery,
} from './inventory.interface';
import { InventoryService } from './inventory.service';

const adjustStock = catchAsync(async (req: TRequest<TAdjustStockPayload>, res) => {
  const result = await InventoryService.adjustStock(getAuthenticatedUser(req), req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Stock adjusted successfully!',
    data: result,
  });
});

const getAllMovements = catchAsync(async (req: TQueryRequest<TMovementFilters>, res) => {
  const { meta, data } = await InventoryService.getAllMovements(req.query, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Stock movements retrieved successfully!',
    meta,
    data,
  });
});

const getLowStockCatalogs = catchAsync(
  async (req: TQueryRequest<TLowStockQuery>, res) => {
    const { meta, data } = await InventoryService.getLowStockCatalogs(req.query, req.query);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Low stock catalogs retrieved successfully!',
      meta,
      data,
    });
  },
);

const getStockSummary = catchAsync(async (req: TQueryRequest<TStockSummaryQuery>, res) => {
  const result = await InventoryService.getStockSummary(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Stock summary retrieved successfully!',
    data: result,
  });
});

export const InventoryController = {
  adjustStock,
  getAllMovements,
  getLowStockCatalogs,
  getStockSummary,
};
