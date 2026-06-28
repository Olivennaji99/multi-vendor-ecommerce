# NovaShop — Multi-Vendor E-Commerce Platform

A production-ready multi-vendor marketplace with three roles (Admin, Seller, Customer), a Next.js storefront and dashboards, and a fully independent Express REST API backed by the same MongoDB database.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **Bun** as the package manager
- **Express.js** standalone REST API (`server/`)
- **MongoDB** via **Mongoose**
- **NextAuth (Auth.js v5)** — credentials + JWT sessions, role-based
- **TanStack React Query** (client-side server-state) + **Zustand** (client UI state)
- **Recharts** for dashboard analytics
- **Zod** + **React Hook Form** for validation
- **Framer Motion** for motion, **Lucide** for icons

## Architecture

This is a single repository with three logical parts:

```
multi-vendor-ecommerce/
├── src/                 # Next.js app (storefront, all 3 dashboards, auth)
├── server/              # Standalone Express REST API (own package.json)
├── shared/              # Mongoose models, Zod schemas, business-logic services
├── scripts/             # bun/tsx-runnable seed & account-creation scripts
├── public/uploads/      # Local file storage target (StorageProvider adapter)
└── docs/                # Setup, MongoDB, and deployment guides
```

**Why a shared layer instead of two separate backends?** All business logic (auth, products, cart, orders, discounts, analytics, notifications) lives once in `shared/services/*`, backed by `shared/models/*`. Next.js Server Actions and Route Handlers call these services directly for fast SSR with no extra network hop. The Express API in `server/` calls the **exact same** service functions through its own controllers — so it's a fully independent, working REST API (useful for a future mobile app or third-party integration), without any business logic being duplicated or drifting out of sync.

Every privileged service function takes an explicit `actor: { id, role }` and enforces permissions itself — this is the real authorization boundary, used identically by both transports. `src/proxy.ts` (this Next.js version renames `middleware.ts` to `proxy.ts`) only does coarse, optimistic redirects for UX.

## Roles

- **Admin** — full platform control: users, sellers, categories, products, orders, discounts, homepage curation (featured/trending/recommended/flash sales), and platform-wide analytics.
- **Seller** — created by Admin only (default password = lowercase `firstnamelastname`, forced change on first login). Manages own products/inventory/orders within assigned categories, with low-stock alerts and sales analytics.
- **Customer** — public signup. Browse/search/filter freely; must be signed in to use cart, wishlist, reviews, and checkout.

## Getting Started

See **[docs/SETUP.md](docs/SETUP.md)** for the full local setup guide and **[docs/MONGODB_SETUP.md](docs/MONGODB_SETUP.md)** for database setup (local or Atlas).

Quick start:

```bash
bun install
cp .env.example .env.local
cp server/.env.example server/.env
# fill in MONGODB_URI (and AUTH_SECRET) in both files

bun run create-admin -- --email=admin@example.com --password=YourPassword123!
bun run seed   # optional - populates categories, demo sellers, products, customers, orders

bun run dev:all   # runs the Next.js app (:3000) and the Express API (:4000) together
```

Then sign in at `http://localhost:3000/login`.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Next.js dev server only |
| `bun run dev:server` | Express API dev server only (`tsx watch`) |
| `bun run dev:all` | Both, concurrently |
| `bun run dev:db` | Spin up a local in-memory MongoDB (no install needed) for trying the app without a real database |
| `bun run build` | Production build of the Next.js app |
| `bun run lint` | ESLint over the whole repo |
| `bun run create-admin -- --email=... --password=...` | Create (or no-op if it exists) an admin account |
| `bun run create-seller -- --firstName=... --lastName=... --email=... --categories=slug1,slug2 --adminEmail=...` | Create a seller account the same way the Admin UI does |
| `bun run seed` | Idempotently seed categories, demo sellers/products/customers/orders |

Inside `server/`: `bun run --cwd server dev` / `build` (type-check) / `start`.

## Project Structure (Next.js app, `src/`)

```
src/
├── app/            # App Router routes: (auth), (shop) storefront+customer, admin, seller, api
├── actions/        # Server Actions (mutations called from forms)
├── components/     # ui/ (shadcn) + storefront/, dashboard/, admin/, account/, auth/, states/
├── hooks/          # React Query hooks (cart, wishlist, notifications, products)
├── stores/         # Zustand (UI state only - cart/wishlist data lives in React Query)
├── lib/            # auth.ts (NextAuth config), api-client.ts, route-helpers.ts, utils.ts
├── providers/      # Theme, Session, React Query providers
├── proxy.ts        # Role-based route gating (this Next version's middleware.ts)
└── types/          # next-auth.d.ts module augmentation
```

`shared/` mirrors this with `models/`, `schemas/`, `services/`, `providers/{storage,payment}/`, and `lib/` (errors, pagination, formatting). `server/src/` has `routes/`, `controllers/`, `middleware/` only — it has no models or business logic of its own by design (see Architecture above).

## Adapters

- **Payment**: `shared/providers/payment/` defines a `PaymentProvider` interface (`initiate`/`verify`). `DummyPaymentProvider` simulates an instant success today; swapping in Stripe/Paystack/Flutterwave later means implementing the same interface — no checkout business logic changes.
- **Storage**: `shared/providers/storage/` defines a `StorageProvider` interface (`upload`/`delete`/`getPublicUrl`). `LocalStorageProvider` writes to `public/uploads/` today; a future `S3StorageProvider` is a drop-in.

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for deploying the Next.js app and the Express API as two separate services.
