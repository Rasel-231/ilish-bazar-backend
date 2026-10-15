# Ilish-Bazar Backend

A production-ready TypeScript + Express backend for an e-commerce platform, built with Prisma, Redis, Zod and JWT authentication.

## Tech Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js + TypeScript (strict) |
| Framework | Express |
| Database | PostgreSQL + Prisma ORM |
| Caching / sessions | Redis (ioredis) |
| Validation | Zod |
| Auth | JWT (access / refresh / reset) + bcrypt |
| File upload | Cloudinary + Multer |
| Payments | SSLCommerz |
| Email | Nodemailer (Gmail SMTP) |
| AI content | OpenRouter API |
| Security | Helmet, CORS allow-list, rate limiting, compression |

## Features

- **Modular architecture** — feature modules (`route → controller → service`) under `src/app/modules`.
- **End-to-end type safety** — no `any`; entity types are derived from Prisma (`Prisma.XGetPayload`), request payloads/filters are inferred from Zod schemas, and enums live in a dedicated `enum.prisma`.
- **Auth & authorization** — register/login, refresh tokens, password change/forgot/reset, role-based access (`USER` / `ADMIN`).
- **Products, orders, payments, messages** — full CRUD with pagination, filtering, sorting and search.
- **Centralized error handling** — narrows `unknown`, maps Prisma (`P2002`, `P2025`, `P2003`) and `ZodError` to clean API responses.
- **Operational readiness** — `/health` and `/health/ready` probes, graceful shutdown, request logging.

## Project Structure

```
my-premium-backend/
├── src/
│   ├── app.ts                     # Express app (security, parsers, routes, health)
│   ├── server.ts                  # Bootstrap + graceful shutdown
│   ├── app/
│   │   ├── modules/               # Feature modules
│   │   │   └── <module>/
│   │   │       ├── <module>.constant.ts     # select shapes + Prisma-derived types
│   │   │       ├── <module>.controller.ts   # typed request handlers
│   │   │       ├── <module>.interface.ts    # Zod-inferred payload types
│   │   │       ├── <module>.route.ts        # route definitions
│   │   │       ├── <module>.service.ts       # data access / business logic
│   │   │       └── <module>.validation.ts    # Zod schemas
│   │   ├── prisma/                # Multi-file Prisma schema
│   │   │   ├── schema.prisma      # Generator & datasource
│   │   │   ├── enum.prisma        # All enums (single source of truth)
│   │   │   ├── user.prisma
│   │   │   ├── product.prisma
│   │   │   ├── order.prisma
│   │   │   ├── payment.prisma
│   │   │   └── message.prisma
│   │   └── routes/index.ts        # Route aggregator (mounted at /api/v1)
│   ├── config/index.ts            # Typed env config
│   ├── errors/ApiError.ts         # Custom error class
│   ├── middlewares/               # auth, validateRequest, upload, error handling, rate limiting
│   ├── shared/                    # prisma, redis, jwt, pagination, logger
│   ├── types/                     # common, enums, express augmentation, barrel
│   └── utils/                     # catchAsync, sendResponse, helpers
├── prisma.config.ts
├── package.json
├── tsconfig.json
└── .env
```

## Prerequisites

- Node.js >= 18
- PostgreSQL
- Redis
- Cloudinary account
- SSLCommerz merchant account
- OpenRouter API key
- Gmail account (for email)

## Environment Variables

Create a `.env` file in the project root:

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` \| `production` |
| `PORT` | Server port (default `5000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `FRONTEND_URL` | Frontend origin |
| `BASE_URL` | Public backend base URL |
| `CORS_ORIGINS` | Comma-separated allowed origins (falls back to `FRONTEND_URL`) |
| `JWT_SECRET` | Access-token signing secret (**required**) |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret (**required**) |
| `JWT_RESET_SECRET` | Reset-token signing secret (**required**) |
| `JWT_EXPIRES_IN` | Access token expiry (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default `30d`) |
| `SALT_ROUND` | bcrypt salt rounds (default `10`) |
| `CLOUD_NAME` / `API_KEY` / `API_SECRET` | Cloudinary credentials |
| `Store_ID` / `Store_Password` | SSLCommerz credentials |
| `SSLCOMMERZ_IS_LIVE` | `true` to use the live SSLCommerz endpoints |
| `SUPPORT_EMAIL` / `APP_PASSWORD` | Gmail sender address and app password |
| `AI_API_KEY` | OpenRouter API key |

## Setup & Installation

```bash
# 1. Install dependencies (peer-dependency resolution required)
npm install --legacy-peer-deps

# 2. Generate Prisma client
npm run prisma:generate

# 3. Push schema to the database
npm run prisma:push

# 4. Start the dev server
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:migrate` | Run Prisma migrations |

## API Endpoints

Base URL: `/api/v1`

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/health/ready` | Readiness probe (checks DB/Redis) |

### Auth (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Login |
| `POST` | `/logout` | Logout |
| `POST` | `/refresh-token` | Refresh access token |
| `POST` | `/change-password` | Change password (auth) |
| `POST` | `/forgot-password` | Request reset link |
| `POST` | `/reset-password` | Reset password |

### Users (`/users`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register (avatar upload) |
| `GET` | `/me` | Current user profile |
| `PATCH` | `/me` | Update own profile |
| `GET` | `/` | List users (admin, paginated) |
| `POST` | `/` | Create user (admin) |
| `GET` | `/:id` | Get user (admin) |
| `PATCH` | `/:id` | Update user (admin) |
| `DELETE` | `/:id` | Delete user (admin) |

### Products (`/products`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List products (paginated) |
| `GET` | `/:id` | Get product |
| `POST` | `/` | Create product (admin) |
| `PATCH` | `/:id` | Update product (admin) |
| `DELETE` | `/:id` | Delete product (admin) |

### Orders (`/orders`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create order |
| `GET` | `/` | List orders |
| `GET` | `/:id` | Get order |
| `POST` | `/:id/cancel` | Cancel order |
| `PATCH` | `/:id/status` | Update status (admin) |

### Payments (`/payments`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create payment |
| `GET` | `/` | List payments |
| `GET` | `/:id` | Get payment |
| `POST` | `/:id/confirm` | Confirm payment |
| `POST` | `/:id/fail` | Mark payment as failed |
| `POST` | `/:id/refund` | Refund payment (admin) |

### Messages (`/messages`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Send message |
| `GET` | `/` | List messages |
| `GET` | `/:id` | Get message |
| `PATCH` | `/:id/read` | Mark as read |
| `PATCH` | `/:id` | Update message |
| `DELETE` | `/:id` | Delete message |

## Database Models

- **User** — email, password, name, role (`USER`/`ADMIN`), avatar, active status.
- **Product** — name, description, price, stock, unit, category, image, active status.
- **Order** — user, items, shipping details, totals, status, payment status.
- **Payment** — order, amount, method, status, transaction ID, gateway response.
- **Message** — sender, receiver, content, read state, optional parent (threading).

Enums are defined once in `src/app/prisma/enum.prisma` and shared across models.
