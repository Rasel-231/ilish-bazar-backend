import type { Request } from 'express';

import type { UserRole } from './enums';

export type TSortOrder = 'asc' | 'desc';

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: TSortOrder;
}

export interface IPaginationResult {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: TSortOrder;
}

export interface IMeta {
  page: number;
  limit: number;
  total: number;
}

export interface IGenericResponse<T> {
  meta: IMeta;
  data: T;
}

export interface IGenericErrorMessage {
  path: string | number;
  message: string;
}

export interface IAuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface ISendResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: IMeta;
}

/**
 * Strongly-typed Express request helper. Body / Params / Query are inferred
 * from the module's Zod schemas.
 *
 * Generic order is (body, params, query) so the common cases stay terse:
 *   - body only:  TRequest<TBody>
 *   - body+params: TRequest<TBody, TParams>
 *   - query only: TRequest<unknown, Request['params'], TQuery>
 */
export type TRequest<
  TBody = unknown,
  TParams = Request['params'],
  TQuery = Request['query'],
> = Request<TParams, unknown, TBody, TQuery>;

export type TBodyRequest<TBody> = TRequest<TBody>;
export type TParamsRequest<TParams> = TRequest<unknown, TParams>;
export type TBodyParamsRequest<TBody, TParams> = TRequest<TBody, TParams>;
export type TQueryRequest<TQuery> = TRequest<unknown, Request['params'], TQuery>;

export type TAuthContext = { user?: IAuthenticatedUser };
