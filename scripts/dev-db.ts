import { MongoMemoryServer } from "mongodb-memory-server";

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { dbName: "verbum_ecommerce" },
  });
  const uri = mongod.getUri("verbum_ecommerce");

  console.log("MONGODB_URI=" + uri);
  console.log("In-memory MongoDB is running. Press Ctrl+C to stop.");

  process.on("SIGINT", async () => {
    await mongod.stop();
    process.exit(0);
  });

  await new Promise(() => {});
}

main().catch((err) => {
  console.error("Failed to start in-memory MongoDB:", err);
  process.exit(1);
});
