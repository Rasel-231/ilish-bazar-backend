import { z } from 'zod';

import { messageValidation } from './message.validation';

export type { TMessage, TMessageUser } from './message.constant';

export type TCreateMessagePayload = z.infer<
  typeof messageValidation.createMessageSchema
>['body'];
export type TUpdateMessagePayload = z.infer<
  typeof messageValidation.updateMessageSchema
>['body'];
export type TMessageFilters = z.infer<typeof messageValidation.listMessagesSchema>['query'];
export type TMessageIdParam = z.infer<typeof messageValidation.idParamSchema>['params'];
