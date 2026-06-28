import "dotenv/config";

import { connectToDatabase } from "@shared/db/connection";
import { Category } from "@shared/models/Category.model";
import { Order } from "@shared/models/Order.model";
import { OrderItem } from "@shared/models/OrderItem.model";
import { Product } from "@shared/models/Product.model";
import { User } from "@shared/models/User.model";

async function main() {
  await connectToDatabase();

  const products = await Product.find({}).select("name slug seller category");
  console.log(`Total products: ${products.length}`);
  for (const product of products) {
    const seller = await User.findById(product.seller);
    const category = await Category.findById(product.category);
    if (!seller || !category) {
      console.log(
        `ORPHANED product "${product.name}" (${product._id}) - seller missing: ${!seller}, category missing: ${!category}`
      );
    }
  }

  const orders = await Order.find({}).select("orderNumber customer items");
  console.log(`\nTotal orders: ${orders.length}`);
  for (const order of orders) {
    const customer = await User.findById(order.customer);
    if (!customer) {
      console.log(`ORPHANED order "${order.orderNumber}" (${order._id}) - customer missing`);
    }
    for (const itemId of order.items) {
      const item = await OrderItem.findById(itemId);
      if (!item) {
        console.log(`  Order ${order.orderNumber} references missing OrderItem ${itemId}`);
        continue;
      }
      const product = await Product.findById(item.product);
      const seller = await User.findById(item.seller);
      if (!product || !seller) {
        console.log(
          `  Order ${order.orderNumber} item "${item.nameSnapshot}" - product missing: ${!product}, seller missing: ${!seller}`
        );
      }
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
