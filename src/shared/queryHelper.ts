import type { IPaginationOptions } from '../types';

export type TSortOrder = 'asc' | 'desc';

export type TCondition = Record<string, unknown> | false | null | undefined;

export interface IBuildWhereInputOptions {
  searchTerm?: string;
  searchableFields?: readonly string[];
  conditions?: TCondition[];
  accessScope?: Record<string, unknown>;
}

export interface IBuildOrderByOptions {
  sortBy?: string;
  sortOrder?: TSortOrder;
  sortableFields: readonly string[];
  defaultSortBy?: string;
}

export const buildSearchCondition = (
  searchTerm: string,
  searchableFields: readonly string[],
): Record<string, unknown> => ({
  OR: searchableFields.map((field) => ({
    [field]: { contains: searchTerm, mode: 'insensitive' },
  })),
});

export const buildAccessScope = (
  isAdmin: boolean,
  userId: string,
  field = 'userId',
): Record<string, unknown> => (isAdmin ? {} : { [field]: userId });

export const buildWhereInput = <TWhereInput = Record<string, unknown>>({
  searchTerm,
  searchableFields = [],
  conditions = [],
  accessScope,
}: IBuildWhereInputOptions): TWhereInput => {
  const andConditions: Record<string, unknown>[] = [];

  if (accessScope && Object.keys(accessScope).length > 0) {
    andConditions.push(accessScope);
  }

  if (searchTerm && searchableFields.length > 0) {
    andConditions.push(buildSearchCondition(searchTerm, searchableFields));
  }

  for (const condition of conditions) {
    if (condition) {
      andConditions.push(condition);
    }
  }

  return (andConditions.length > 0 ? { AND: andConditions } : {}) as TWhereInput;
};

export const buildOrderBy = <TOrderBy = Record<string, TSortOrder>>({
  sortBy,
  sortOrder = 'desc',
  sortableFields,
  defaultSortBy = 'createdAt',
}: IBuildOrderByOptions): TOrderBy => {
  const field =
    sortBy && sortableFields.includes(sortBy) ? sortBy : defaultSortBy;

  return { [field]: sortOrder } as TOrderBy;
};

export const toBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
};

export const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const toPaginationOptions = (
  query: Record<string, unknown>,
): IPaginationOptions => ({
  page: toNumber(query.page),
  limit: toNumber(query.limit),
  sortBy: query.sortBy ? String(query.sortBy) : undefined,
  sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
});
