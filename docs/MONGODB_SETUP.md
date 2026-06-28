# MongoDB Setup Guide

The Next.js app and the Express API connect to the **same** MongoDB database independently (each reads `MONGODB_URI` from its own `.env` file). Pick one of the three options below.

## Option A — MongoDB Atlas (recommended for anything beyond a quick local try)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → add a database user with a username/password.
3. **Network Access** → add your current IP (or `0.0.0.0/0` for local development only — never in production).
4. **Connect** → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
5. Append a database name, e.g. `.../verbum_ecommerce?retryWrites=true&w=majority`, and put the full string in both `.env.local` and `server/.env` as `MONGODB_URI`.

## Option B — Local MongoDB install

1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community (or via your OS package manager — `brew install mongodb-community` on macOS, etc.)
2. Start it (`mongod`, or as a service depending on your install method).
3. Use:
   ```
   MONGODB_URI=mongodb://localhost:27017/verbum_ecommerce
   ```
   in both `.env.local` and `server/.env`.

## Option C — Zero-install in-memory MongoDB (development/demo only)

No install needed — useful for quickly trying the app or for this sandboxed environment:

```bash
bun run dev:db
```

This downloads a real `mongod` binary on first run and starts it in-memory, printing a `MONGODB_URI` to paste into both `.env` files. **Data is lost when the process stops** — don't use this for anything you want to keep. It must keep running in its own terminal alongside `bun run dev:all`.

## Indexes

Mongoose creates indexes automatically from the schema definitions in `shared/models/*` the first time each model is used (unique indexes on `User.email`, `Product.slug`, `Category.slug`, `Order.orderNumber`; a compound unique index on `Review` per `(product, customer)`; a text index on `Product` for search; etc.). No manual index setup is required for local development.

For production on Atlas, index builds happen in the background by default and won't block traffic, but for a very large existing dataset you may want to verify index build status in the Atlas UI (**Indexes** tab on the collection) after first deploy.

## Inspecting data

Any MongoDB GUI works: [MongoDB Compass](https://www.mongodb.com/products/compass) (official, free) or the `mongosh` shell:

```bash
mongosh "$MONGODB_URI"
> use verbum_ecommerce
> db.products.find().limit(5)
```
