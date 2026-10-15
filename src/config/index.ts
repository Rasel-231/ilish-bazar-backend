import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';

const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const required = (key: string, value: string | undefined): string => {
  if (!value) {
    if (isProduction) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    throw new Error(`Missing environment variable: ${key}. Add it to your .env file.`);
  }
  return value;
};

const optional = (value: string | undefined, fallback: string): string => value ?? fallback;

const toOriginList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const config = {
  env: process.env.NODE_ENV ?? 'development',
  isProduction,
  isTest: process.env.NODE_ENV === 'test',
  port: toPositiveNumber(process.env.PORT, 5000),

  frontend_url: optional(process.env.FRONTEND_URL, 'http://localhost:3000'),
  base_url: optional(process.env.BASE_URL, 'http://localhost:5000/api/v1'),
  cors_origins: toOriginList(process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL),

  database_url: optional(
    process.env.DATABASE_URL,
    'postgresql://postgres:postgres@localhost:5432/ilish_Bazar_Db?schema=public',
  ),
  redis_url: optional(process.env.REDIS_URL, 'redis://localhost:6379'),

  salt_rounds: toPositiveNumber(process.env.SALT_ROUND, 10),

  jwt: {
    access_secret: required('JWT_SECRET', process.env.JWT_SECRET),
    refresh_secret: required('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
    reset_secret: required('JWT_RESET_SECRET', process.env.JWT_RESET_SECRET),
    access_expires_in: optional(process.env.JWT_EXPIRES_IN, '15m'),
    refresh_expires_in: optional(process.env.JWT_REFRESH_EXPIRES_IN, '30d'),
  },

  cloudinary: {
    cloud_name: optional(process.env.CLOUD_NAME, ''),
    api_key: optional(process.env.API_KEY, ''),
    api_secret: optional(process.env.API_SECRET, ''),
  },

  sslcommerz: {
    store_id: optional(process.env.Store_ID, ''),
    store_password: optional(process.env.Store_Password, ''),
    is_live: process.env.SSLCOMMERZ_IS_LIVE === 'true',
  },

  email: {
    support_email: optional(process.env.SUPPORT_EMAIL, ''),
    app_password: optional(process.env.APP_PASSWORD, ''),
  },

  ai_api_key: optional(process.env.AI_API_KEY, ''),
} as const;

export type AppConfig = typeof config;

export default config;
