# @verbum/server

Standalone Express REST API for the NovaShop multi-vendor platform. Runs independently of the Next.js app — it talks to MongoDB directly via the business-logic services in `../shared/`, not through the Next.js app.

See the root [README.md](../README.md) for the full architecture explanation, and [docs/SETUP.md](../docs/SETUP.md) / [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for setup and deployment instructions.

## Quick reference

```bash
cp .env.example .env        # fill in MONGODB_URI and JWT_SECRET
bun run --cwd server dev    # tsx watch src/index.ts, on :4000 by default
bun run --cwd server build  # type-check (tsc --noEmit)
bun run --cwd server start  # tsx src/index.ts
```

```bash
curl http://localhost:4000/health
```

## Structure

```
src/
├── index.ts          # entrypoint: connects to MongoDB, starts the HTTP server
├── app.ts             # Express app: middleware + route mounting
├── config/env.ts      # zod-validated process.env
├── middleware/         # auth (JWT), validation (Zod), error handling, file upload
├── routes/             # one file per domain, mounted under /api/v1
└── controllers/        # thin: parse req -> call a shared/services/* function -> respond
```

There are deliberately no `models/` or business-logic `services/` here — see the root README's "Architecture" section for why.
