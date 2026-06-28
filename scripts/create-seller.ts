import "dotenv/config";

import { connectToDatabase } from "@shared/db/connection";
import { Category } from "@shared/models/Category.model";
import { User } from "@shared/models/User.model";
import { createSeller } from "@shared/services/seller.service";

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const firstName = args.firstName;
  const lastName = args.lastName;
  const email = args.email?.toLowerCase();
  const phone = args.phone ?? "+2348000000000";
  const storeName = args.storeName ?? `${firstName ?? ""} ${lastName ?? ""}`.trim();
  const categorySlugs = (args.categories ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const adminEmail = args.adminEmail;

  if (!firstName || !lastName || !email || categorySlugs.length === 0 || !adminEmail) {
    console.error(
      'Usage: bun run create-seller -- --firstName=John --lastName=Doe --email=john@x.com --categories=fashion,beauty --adminEmail=admin@novashop.test [--phone="+234..."] [--storeName="John\'s Store"]'
    );
    process.exit(1);
  }

  await connectToDatabase();

  const admin = await User.findOne({ email: adminEmail.toLowerCase(), role: "ADMIN" });
  if (!admin) {
    console.error(
      `No admin found with email ${adminEmail}. Create one first with "bun run create-admin".`
    );
    process.exit(1);
  }

  const categories = await Category.find({ slug: { $in: categorySlugs } });
  if (categories.length !== categorySlugs.length) {
    console.error(
      `Could not find all categories: ${categorySlugs.join(", ")}. Run the seed script first or check spelling.`
    );
    process.exit(1);
  }

  const { user, defaultPassword } = await createSeller(
    { id: admin._id.toString(), role: "ADMIN" },
    {
      firstName,
      lastName,
      email,
      phone,
      categories: categories.map((c) => c._id.toString()),
      storeName,
      bio: "",
    }
  );

  console.log("Seller account created:");
  console.log(`  Email:    ${user.email}`);
  console.log(`  Password: ${defaultPassword}`);
  console.log("The seller will be required to change this password on first login.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create seller:", err);
  process.exit(1);
});
