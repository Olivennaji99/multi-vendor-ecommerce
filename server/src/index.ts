import "dotenv/config";

import { connectToDatabase } from "@shared/db/connection.js";

import { createApp } from "./app.js";
import { env } from "./config/env.js";

async function main() {
  await connectToDatabase();
  console.log("Connected to MongoDB");

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`@verbum/server listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
