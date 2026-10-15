import { z } from 'zod';

import { userValidation } from './user.validation';

export type { TPublicUser } from './user.constant';

export type TCreateUserPayload = z.infer<typeof userValidation.createUserSchema>['body'];
export type TRegisterUserPayload = z.infer<typeof userValidation.registerUserSchema>['body'];
export type TUpdateUserPayload = z.infer<typeof userValidation.updateUserSchema>['body'];
export type TUpdateProfilePayload = z.infer<typeof userValidation.updateProfileSchema>['body'];
export type TUserFilters = z.infer<typeof userValidation.listUsersSchema>['query'];
export type TUserIdParam = z.infer<typeof userValidation.idParamSchema>['params'];
