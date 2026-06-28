# Local Setup Guide

## Prerequisites

- [Bun](https://bun.sh) 1.3+ (package manager for both the Next.js app and the Express API)
- Node.js 20.9+ (Next.js 16's CLI shims and `tsx` run on Node, even though Bun manages packages)
- A MongoDB connection string — see [MONGODB_SETUP.md](./MONGODB_SETUP.md) for local install, Atlas, or a zero-install in-memory option

## 1. Install dependencies

From the repo root (this also installs the `server/` workspace's dependencies):

```bash
bun install
```

## 2. Configure environment variables

```bash
cp .env.example .env.local
cp server/.env.example server/.env
```

Fill in at minimum:

- `.env.local`: `MONGODB_URI`, `AUTH_SECRET` (generate with `openssl rand -base64 32`)
- `server/.env`: `MONGODB_URI` (same database), `JWT_SECRET` (a different random string — see why in the README's Architecture section)

If you don't have MongoDB installed yet, run `bun run dev:db` in a separate terminal — it starts a local in-memory MongoDB and prints a `MONGODB_URI` you can paste into both `.env` files. This is for trying the app quickly; for anything you want to keep, use a real MongoDB (see [MONGODB_SETUP.md](./MONGODB_SETUP.md)).

## 3. Create your admin account

```bash
bun run create-admin -- --email=admin@example.com --password=YourPassword123!
```

Re-running with the same email is a safe no-op.

## 4. (Optional) Seed demo data

```bash
bun run seed
```

This creates 9 categories, 3 demo sellers (with generated passwords printed to the console), 9 products across them, 2 demo customers, and — on a fresh database — a few demo orders and reviews so the dashboards and homepage aren't empty.

## 5. Run the app

```bash
bun run dev:all
```

This runs the Next.js app at `http://localhost:3000` and the Express API at `http://localhost:4000` together. To run them separately: `bun run dev` and `bun run dev:server`.

## 6. Sign in

- Storefront / customer signup: `http://localhost:3000/register`
- Sign in (any role): `http://localhost:3000/login`
- Admin dashboard: `http://localhost:3000/admin/dashboard`
- Seller dashboard: `http://localhost:3000/seller/dashboard`

A seller's first login always redirects to a forced password-change screen (the default password is `firstnamelastname`, lowercase, no spaces — printed by `create-seller` or `seed`).

## Verifying the Express API independently

The Express API has no dependency on the Next.js app being up — it talks to MongoDB directly:

```bash
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword123!"}'
```

## Troubleshooting

- **`NotImplementedError: node:v8 isBuildingSnapshot is not yet implemented in Bun`** — this happens if something that imports Mongoose is run directly via `bun run file.ts`. All scripts in this repo already route through `tsx` (a Node-based runner) instead for exactly this reason; if you add a new script, follow the same pattern (`tsx scripts/your-script.ts`, not `bun run scripts/your-script.ts`).
- **`MissingSchemaError: Schema hasn't been registered for model "X"`** — make sure any new code path calls `connectToDatabase()` from `shared/db/connection.ts` before touching a model; it registers every model as a side effect specifically to avoid this.
- **Build fails with a type error on a field with `.optional().default(...)`** — Zod schemas with a default make that field non-optional in the *output* type. When constructing such an object by hand (not via `.parse()`), include the field explicitly.
