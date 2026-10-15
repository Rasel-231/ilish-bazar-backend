import express from 'express';

import { auth } from '../../../middlewares/auth';
import { upload } from '../../../middlewares/upload';
import { validateRequest } from '../../../middlewares/validateRequest';
import { CatalogController } from './catalog.controller';
import { catalogValidation } from './catalog.validation';

const router = express.Router();

router.get(
  '/',
  validateRequest(catalogValidation.listCatalogsSchema),
  CatalogController.getAllCatalogs,
);

router.get(
  '/:id',
  validateRequest(catalogValidation.idParamSchema),
  CatalogController.getCatalogById,
);

router.post(
  '/',
  auth('ADMIN'),
  upload.single('image'),
  validateRequest(catalogValidation.createCatalogSchema),
  CatalogController.createCatalog,
);

router.patch(
  '/:id',
  auth('ADMIN'),
  upload.single('image'),
  validateRequest(catalogValidation.idParamSchema),
  validateRequest(catalogValidation.updateCatalogSchema),
  CatalogController.updateCatalog,
);

router.delete(
  '/:id',
  auth('ADMIN'),
  validateRequest(catalogValidation.idParamSchema),
  CatalogController.deleteCatalog,
);

export const CatalogRoutes = router;
