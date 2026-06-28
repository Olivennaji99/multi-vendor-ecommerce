import mongoose from "mongoose";

// Importing the models barrel here (rather than relying on each service to
// import only the model(s) it directly uses) guarantees every model is
// registered with Mongoose before any `.populate()` call needs to resolve a
// ref - populate throws `MissingSchemaError` if the referenced model's
// defining module was never executed in this process.
import "../models";

declare global {
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!globalThis.__mongooseConn) {
    mongoose.set("strictQuery", true);
    globalThis.__mongooseConn = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "verbum_ecommerce",
    });
  }

  return globalThis.__mongooseConn;
}
