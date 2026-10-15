import express from 'express';

import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { PaymentController } from './payment.controller';
import { paymentValidation } from './payment.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(paymentValidation.createPaymentSchema),
  PaymentController.createPayment,
);

router.get(
  '/',
  auth(),
  validateRequest(paymentValidation.listPaymentsSchema),
  PaymentController.getAllPayments,
);

router.get(
  '/:id',
  auth(),
  validateRequest(paymentValidation.idParamSchema),
  PaymentController.getPaymentById,
);

router.post(
  '/:id/confirm',
  auth(),
  validateRequest(paymentValidation.idParamSchema),
  validateRequest(paymentValidation.confirmPaymentSchema),
  PaymentController.confirmPayment,
);

router.post(
  '/:id/fail',
  auth(),
  validateRequest(paymentValidation.idParamSchema),
  PaymentController.failPayment,
);

router.post(
  '/:id/refund',
  auth('ADMIN'),
  validateRequest(paymentValidation.idParamSchema),
  PaymentController.refundPayment,
);

export const PaymentRoutes = router;
