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
  TCreateProductPayload,
  TProductFilters,
  TProductIdParam,
  TUpdateProductPayload,
} from './product.interface';
import { ProductService } from './product.service';

const createProduct = catchAsync(async (req: TRequest<TCreateProductPayload>, res) => {
  const result = await ProductService.createProduct(
    req.body,
    getAuthenticatedUser(req).id,
    req.file?.path,
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Product created successfully!',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: TQueryRequest<TProductFilters>, res) => {
  const { meta, data } = await ProductService.getAllProducts(req.query, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products retrieved successfully!',
    meta,
    data,
  });
});

const getProductById = catchAsync(
  async (req: TParamsRequest<TProductIdParam>, res) => {
    const result = await ProductService.getProductById(req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product retrieved successfully!',
      data: result,
    });
  },
);

const updateProduct = catchAsync(
  async (req: TBodyParamsRequest<TUpdateProductPayload, TProductIdParam>, res) => {
    const result = await ProductService.updateProduct(
      req.params.id,
      req.body,
      req.file?.path,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product updated successfully!',
      data: result,
    });
  },
);

const deleteProduct = catchAsync(
  async (req: TParamsRequest<TProductIdParam>, res) => {
    const result = await ProductService.deleteProduct(req.params.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product deleted successfully!',
      data: result,
    });
  },
);

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
