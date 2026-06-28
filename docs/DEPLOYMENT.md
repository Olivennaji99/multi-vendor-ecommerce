# Deployment Guide

The Next.js app and the Express API are two independently deployable services that share one MongoDB database. Deploy them separately.

## Important: local file storage and serverless platforms

`StorageProvider`'s default implementation (`LocalStorageProvider`) writes uploaded product images to disk at `public/uploads/`. This works on any host with a **persistent, writable filesystem** (a VPS, a Docker container with a mounted volume, Render/Railway's persistent disks). It does **not** survive on platforms with ephemeral or read-only filesystems per-request (e.g. Vercel serverless functions) — uploaded files would disappear on the next deploy or cold start.

Before deploying to a serverless platform, either:
- Deploy both the Next.js app and the Express API to a host with persistent disk (Render, Railway, Fly.io, a plain VPS), or
- Implement an `S3StorageProvider` (or similar) against the existing `StorageProvider` interface in `shared/providers/storage/` and switch `STORAGE_PROVIDER=s3` — no other code changes needed, by design.

## 1. MongoDB

Use MongoDB Atlas for any real deployment (see [MONGODB_SETUP.md](./MONGODB_SETUP.md)). In Atlas **Network Access**, allow the IPs of wherever you deploy the Next.js app and the Express API (or `0.0.0.0/0` if both run on platforms with dynamic egress IPs — tighten this once you know your hosts' IP ranges).

## 2. Deploying the Next.js app

Any Next.js-compatible host works (Vercel, Render, Railway, a VPS with `bun run build && bun run start`).

Environment variables to set:

| Variable | Notes |
| --- | --- |
| `MONGODB_URI` | Same Atlas database as the Express API |
| `MONGODB_DB_NAME` | Optional, defaults to `verbum_ecommerce` |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32`. **Different value in production than development.** |
| `AUTH_URL` | Your production URL, e.g. `https://shop.example.com` |
| `NEXT_PUBLIC_API_URL` | Public URL of the deployed Express API (informational/for future external clients — the Next app itself talks to MongoDB directly, not through this API) |
| `STORAGE_PROVIDER` | `local` (see filesystem caveat above) or `s3` once implemented |
| `PAYMENT_PROVIDER` | `dummy` until a real gateway is implemented |
| `UPLOAD_DIR` | Only needed if `public/uploads` isn't writable at the default path on your host |

Build/start commands: `bun install && bun run build` / `bun run start`.

## 3. Deploying the Express API

Deploy `server/` as its own service (it has its own `package.json`). On most platforms, set the service's root/working directory to `server/`.

Build/start commands: `bun install && bun run --cwd server build` (type-check only — there's no compiled output, see note below) / `bun run --cwd server start`.

> `server`'s `start` script runs `tsx src/index.ts` directly rather than executing pre-built JS. This is intentional for this project's scale — `tsx` runs fine in production for a service this size. If you outgrow that, add a real build step (e.g. `tsc`/`esbuild` bundling to `dist/`) and point `start` at the compiled output instead; no application code needs to change.

Environment variables (`server/.env.example` lists all of these):

| Variable | Notes |
| --- | --- |
| `PORT` | Most platforms inject this automatically — check your host's convention |
| `MONGODB_URI` | Same Atlas database as the Next.js app |
| `JWT_SECRET` | A **different** random secret than the Next.js app's `AUTH_SECRET` — see the README's Architecture section for why |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `CORS_ORIGIN` | The deployed Next.js app's URL, so browser-based external clients can call this API cross-origin |
| `UPLOAD_DIR` | Defaults to `../public/uploads` relative to `server/`'s cwd — adjust if your host's working directory differs |
| `STORAGE_PROVIDER` / `PAYMENT_PROVIDER` | Keep in sync with the Next.js app's values |

## 4. Post-deploy checklist

1. `curl https://your-api-host/health` returns `{"status":"ok",...}`.
2. Create your admin account against the **production** database: `MONGODB_URI=<prod-uri> bun run create-admin -- --email=... --password=...` (run this from your local machine pointed at the production connection string, or as a one-off job on your host).
3. Sign in at `https://your-app-host/login` and confirm the admin dashboard loads with real data.
4. Create a seller through the Admin UI, confirm the forced password-change flow works end to end.
5. Place a test order as a customer and confirm the seller receives an order notification.
