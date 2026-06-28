import "dotenv/config";

import { connectToDatabase } from "@shared/db/connection";
import { User } from "@shared/models/User.model";
import { hashPassword } from "@shared/services/auth.service";

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
  const name = args.name ?? "Platform Admin";
  const email = (args.email ?? "admin@novashop.test").toLowerCase();
  const password = args.password ?? "ChangeMe123!";

  await connectToDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`An admin with email ${email} already exists. Nothing to do.`);
    process.exit(0);
  }

  const admin = await User.create({
    name,
    email,
    password: await hashPassword(password),
    role: "ADMIN",
  });

  console.log("Admin account created:");
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${password}`);
  console.log("Please log in and change this password immediately.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
