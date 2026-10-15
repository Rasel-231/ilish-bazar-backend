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
  TCatalogFilters,
  TCatalogIdParam,
  TCreateCatalogPayload,
  TUpdateCatalogPayload,
} from './catalog.interface';
import { CatalogService } from './catalog.service';

const createCatalog = catchAsync(async (req: TRequest<TCreateCatalogPayload>, res) => {
  const result = await CatalogService.createCatalog(
    req.body,
    getAuthenticatedUser(req).id,
    req.file?.path,
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Catalog created successfully!',
    data: result,
  });
});

const getAllCatalogs = catchAsync(async (req: TQueryRequest<TCatalogFilters>, res) => {
  const { meta, data } = await CatalogService.getAllCatalogs(req.query, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Catalogs retrieved successfully!',
    meta,
    data,
  });
});

const getCatalogById = catchAsync(
  async (req: TParamsRequest<TCatalogIdParam>, res) => {
    const result = await CatalogService.getCatalogById(req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Catalog retrieved successfully!',
      data: result,
    });
  },
);

const updateCatalog = catchAsync(
  async (req: TBodyParamsRequest<TUpdateCatalogPayload, TCatalogIdParam>, res) => {
    const result = await CatalogService.updateCatalog(
      req.params.id,
      req.body,
      req.file?.path,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Catalog updated successfully!',
      data: result,
    });
  },
);

const deleteCatalog = catchAsync(
  async (req: TParamsRequest<TCatalogIdParam>, res) => {
    const result = await CatalogService.deleteCatalog(req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Catalog deleted successfully!',
      data: result,
    });
  },
);

export const CatalogController = {
  createCatalog,
  getAllCatalogs,
  getCatalogById,
  updateCatalog,
  deleteCatalog,
};
