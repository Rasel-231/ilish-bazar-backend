import type { IPaginationOptions, IPaginationResult } from '../types';

const toPositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const calculatePagination = (
  options: IPaginationOptions = {},
): IPaginationResult => {
  const page = toPositiveInteger(options.page, 1);
  const limit = Math.min(100, toPositiveInteger(options.limit, 10));
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy ?? 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
};

export const paginationHelper = {
  calculatePagination,
};
