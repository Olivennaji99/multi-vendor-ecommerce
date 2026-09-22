import "dotenv/config";

import { connectToDatabase } from "@shared/db/connection";
import { Order } from "@shared/models/Order.model";
import { User } from "@shared/models/User.model";
import { getOrderById } from "@shared/services/order.service";

async function main() {
  await connectToDatabase();

  const customer = await User.findOne({ email: "olivennaji99@gmail.com" });
  if (!customer) {
    console.log("Customer not found");
    process.exit(1);
  }

  const orders = await Order.find({ customer: customer._id });
  for (const order of orders) {
    try {
      const result = await getOrderById(
        { id: customer._id.toString(), role: "CUSTOMER" },
        order._id.toString()
      );
      console.log(`OK: ${result.orderNumber}, items populated:`, JSON.stringify(result.items, null, 2).slice(0, 500));
    } catch (err) {
      console.log(`ERROR on ${order.orderNumber}:`);
      console.error(err);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
