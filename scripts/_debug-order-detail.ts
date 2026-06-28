import "dotenv/config";

import { connectToDatabase } from "@shared/db/connection";
import { Order } from "@shared/models/Order.model";
import { getOrderById } from "@shared/services/order.service";

async function main() {
  await connectToDatabase();

  const orders = await Order.find({}).select("_id orderNumber customer");
  for (const order of orders) {
    console.log(`${order.orderNumber} (${order._id}) customer=${order.customer}`);
  }

  console.log("\n--- Attempting getOrderById as ADMIN for each order ---");
  for (const order of orders) {
    try {
      const result = await getOrderById({ id: "000000000000000000000000", role: "ADMIN" }, order._id.toString());
      console.log(`OK: ${result.orderNumber}`);
    } catch (err) {
      console.log(`ERROR on ${order.orderNumber}:`, err instanceof Error ? err.message : err);
      console.error(err);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
