import { v2 as cloudinary } from 'cloudinary';
import type { NextFunction, Request, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import config from '../config';
import { ApiError } from '../errors/ApiError';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 10;

const ALLOWED_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const ALLOWED_CLOUDINARY_FORMATS: readonly string[] = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'pdf',
];

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: 'ecommerce_assets',
    allowed_formats: [...ALLOWED_CLOUDINARY_FORMATS],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  }),
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(
      new ApiError(
        415,
        `Unsupported file type "${file.mimetype}". Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      ),
    );
    return;
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES_PER_REQUEST },
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);

export const uploadArray = (fieldName: string, maxCount = 5) =>
  upload.array(fieldName, maxCount);

export const uploadFields = (fields: { name: string; maxCount?: number }[]) =>
  upload.fields(fields);

const PAYLOAD_TOO_LARGE_CODES: readonly string[] = [
  'LIMIT_FILE_SIZE',
  'LIMIT_FILE_COUNT',
  'LIMIT_PART_COUNT',
];

const REJECTION_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: `File exceeds the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB upload limit!`,
  LIMIT_FILE_COUNT: 'Too many files were sent in a single request!',
  LIMIT_PART_COUNT: 'Multipart payload contains too many sections!',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field name in the request!',
};

export const handleUploadError = (
  error: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (error instanceof multer.MulterError) {
    const statusCode = PAYLOAD_TOO_LARGE_CODES.includes(error.code) ? 413 : 400;
    const reason =
      REJECTION_MESSAGES[error.code] ??
      `File upload rejected (${error.code || 'UNKNOWN_CODE'})`;

    next(new ApiError(statusCode, reason));
    return;
  }

  next(error);
};
