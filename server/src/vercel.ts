import "dotenv/config";

import type { IncomingMessage, ServerResponse } from "http";

import { connectToDatabase } from "@shared/db/connection.js";

import { createApp } from "./app.js";

// Vercel reuses this module across warm invocations, so the app and the DB
// connection are created once per container, not per request.
const app = createApp();
const dbReady = connectToDatabase();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await dbReady;
  app(req, res);
}
