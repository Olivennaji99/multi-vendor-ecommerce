import "dotenv/config";

import { connectToDatabase } from "@shared/db/connection";
import { Order } from "@shared/models/Order.model";
import { OrderItem } from "@shared/models/OrderItem.model";
import { Product } from "@shared/models/Product.model";
import { User } from "@shared/models/User.model";

async function main() {
  await connectToDatabase();

  const orders = await Order.find({}).select("orderNumber customer items status");
  console.log(`Total orders: ${orders.length}`);
  for (const order of orders) {
    const customer = await User.findById(order.customer);
    console.log(
      `${order.orderNumber} (${order._id}) status=${order.status} customer=${customer ? customer.email : "MISSING"}`
    );
    for (const itemId of order.items) {
      const item = await OrderItem.findById(itemId);
      if (!item) {
        console.log(`  -> missing OrderItem ${itemId}`);
        continue;
      }
      const product = await Product.findById(item.product);
      console.log(`  -> item "${item.nameSnapshot}" product exists: ${Boolean(product)}`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
