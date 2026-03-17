# Database migration – MechNow Backend

The backend uses **Prisma ORM with PostgreSQL**. All in-memory stores have been replaced with database operations.

## Prerequisites

- Node.js 18+
- PostgreSQL 12+ (local or hosted)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and set required variables:

```bash
cp .env.example .env
```

Edit `.env` and set:

- **DATABASE_URL** – PostgreSQL connection string, e.g.:
  - Local: `postgresql://postgres:password@localhost:5432/mechnow`
  - Docker: `postgresql://postgres:postgres@localhost:5432/mechnow`
- **JWT_SECRET** – Secret for access tokens (min 32 characters)
- **JWT_REFRESH_SECRET** – Secret for refresh tokens (min 32 characters)

### 3. Create database and run migrations

Create the database (if it does not exist), then run migrations:

```bash
npx prisma migrate dev
```

This will:

- Create the `migrations` folder and initial migration
- Apply the migration to the database
- Generate the Prisma Client (`node_modules/.prisma/client`)

For a **production** or **CI** environment (no interactive prompt):

```bash
npx prisma migrate deploy
```

### 4. (Optional) Seed or inspect data

- Open Prisma Studio: `npx prisma studio`
- Or run the server; in development a seed user may be created on first run (see `src/index.ts`).

## Run the server

```bash
npm run dev
```

The server will:

1. Connect to the database
2. Optionally seed a dev user (non-production)
3. Listen on `http://0.0.0.0:PORT` (default 8082)

## Quick start (local)

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Schema overview

- **User** – Accounts (id, name, email, passwordHash, role, blocked)
- **RefreshToken** – JWT refresh tokens (token, userId)
- **ProviderProfile** – Provider details (userId, location, services, availability, etc.)
- **DeviceToken** – Push notification device tokens (userId, token)
- **Request** – Service requests (customerId, providerId, serviceType, status, origin, etc.)
- **Rating** – Ratings for completed requests (providerId, customerId, requestId, rating, comment)
- **Notification** – In-app notifications (userId, type, title, message, read, data)
- **ChatMessage** – Chat messages per request (requestId, senderId, text)

Relations: Request → Customer/Provider (User), Rating → Request/Provider/Customer, Notification → User, ChatMessage → Request, ProviderProfile → User.

## Resetting the database

To drop and recreate the database and re-apply migrations (development only):

```bash
npx prisma migrate reset
```

This will run all migrations from scratch and optionally run a seed script if configured in `package.json` (`prisma.seed`).
