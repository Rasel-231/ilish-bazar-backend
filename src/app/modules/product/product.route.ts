import express from 'express';

import { auth } from '../../../middlewares/auth';
import { upload } from '../../../middlewares/upload';
import { validateRequest } from '../../../middlewares/validateRequest';
import { ProductController } from './product.controller';
import { productValidation } from './product.validation';

const router = express.Router();

router.get(
  '/',
  validateRequest(productValidation.listProductsSchema),
  ProductController.getAllProducts,
);

router.get(
  '/:id',
  validateRequest(productValidation.idParamSchema),
  ProductController.getProductById,
);

router.post(
  '/',
  auth('ADMIN'),
  upload.single('image'),
  validateRequest(productValidation.createProductSchema),
  ProductController.createProduct,
);

router.patch(
  '/:id',
  auth('ADMIN'),
  upload.single('image'),
  validateRequest(productValidation.idParamSchema),
  validateRequest(productValidation.updateProductSchema),
  ProductController.updateProduct,
);

router.delete(
  '/:id',
  auth('ADMIN'),
  validateRequest(productValidation.idParamSchema),
  ProductController.deleteProduct,
);

export const ProductRoutes = router;
