import express from 'express';
import { MessageController } from './message.controller';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { messageValidation } from './message.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(messageValidation.createMessageSchema),
  MessageController.createMessage,
);

router.get(
  '/',
  auth(),
  validateRequest(messageValidation.listMessagesSchema),
  MessageController.getAllMessages,
);

router.get(
  '/:id',
  auth(),
  validateRequest(messageValidation.idParamSchema),
  MessageController.getMessageById,
);

router.patch(
  '/:id/read',
  auth(),
  validateRequest(messageValidation.idParamSchema),
  MessageController.markMessageAsRead,
);

router.patch(
  '/:id',
  auth(),
  validateRequest(messageValidation.idParamSchema),
  validateRequest(messageValidation.updateMessageSchema),
  MessageController.updateMessage,
);

router.delete(
  '/:id',
  auth(),
  validateRequest(messageValidation.idParamSchema),
  MessageController.deleteMessage,
);

export const MessageRoutes = router;
