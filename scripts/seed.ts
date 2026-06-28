import "dotenv/config";

import { connectToDatabase } from "@shared/db/connection";
import { Category, type ICategory } from "@shared/models/Category.model";
import { CustomerProfile } from "@shared/models/CustomerProfile.model";
import { Order } from "@shared/models/Order.model";
import { Product, type IProduct } from "@shared/models/Product.model";
import { Review } from "@shared/models/Review.model";
import { User, type IUser } from "@shared/models/User.model";
import { hashPassword } from "@shared/services/auth.service";
import { addToCart } from "@shared/services/cart.service";
import { createOrderFromCart } from "@shared/services/order.service";
import { createProduct } from "@shared/services/product.service";
import { createReview } from "@shared/services/review.service";
import { createSeller } from "@shared/services/seller.service";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_SEED = [
  { name: "Fashion", icon: "fashion" },
  { name: "Beauty", icon: "beauty" },
  { name: "Electronics", icon: "electronics" },
  { name: "Sports", icon: "sports" },
  { name: "Home & Living", icon: "home-living" },
  { name: "Books", icon: "books" },
  { name: "Gadgets", icon: "gadgets" },
  { name: "Health", icon: "health" },
  { name: "Grocery", icon: "grocery" },
];

const SELLER_SEED = [
  {
    firstName: "Amara",
    lastName: "Okafor",
    email: "amara.okafor@demo.novashop.test",
    storeName: "Amara's Boutique",
    categoryNames: ["Fashion", "Beauty"],
  },
  {
    firstName: "Chidi",
    lastName: "Eze",
    email: "chidi.eze@demo.novashop.test",
    storeName: "Chidi Electronics",
    categoryNames: ["Electronics", "Gadgets"],
  },
  {
    firstName: "Ngozi",
    lastName: "Bello",
    email: "ngozi.bello@demo.novashop.test",
    storeName: "Ngozi Home & Sports",
    categoryNames: ["Sports", "Home & Living"],
  },
];

const PRODUCT_SEED = [
  { name: "Classic Denim Jacket", price: 25000, discountPrice: 19999, brand: "UrbanWear", sellerIndex: 0, isFeatured: true },
  { name: "Silk Floral Scarf", price: 8000, brand: "UrbanWear", sellerIndex: 0, isTrending: true },
  { name: "Matte Lipstick Set", price: 12000, discountPrice: 9000, brand: "GlowUp", sellerIndex: 0, isRecommended: true },
  { name: "Wireless Earbuds Pro", price: 45000, discountPrice: 35999, brand: "SoundCore", sellerIndex: 1, isFeatured: true, isTrending: true },
  { name: "Smart Fitness Tracker", price: 38000, brand: "FitTech", sellerIndex: 1, isRecommended: true },
  { name: "4K Action Camera", price: 89000, discountPrice: 74999, brand: "SoundCore", sellerIndex: 1 },
  { name: "Ceramic Dinnerware Set", price: 32000, brand: "HomeCraft", sellerIndex: 2, isFeatured: true },
  { name: "Yoga Mat Premium", price: 9500, brand: "FitLife", sellerIndex: 2, isTrending: true },
  { name: "Adjustable Dumbbell Set", price: 56000, discountPrice: 48000, brand: "FitLife", sellerIndex: 2, isRecommended: true },
];

const CUSTOMER_SEED = [
  { name: "Tunde Bakare", email: "tunde.bakare@demo.novashop.test" },
  { name: "Fatima Yusuf", email: "fatima.yusuf@demo.novashop.test" },
];

async function ensureAdmin() {
  let admin = await User.findOne({ email: "admin@novashop.test" });
  if (!admin) {
    admin = await User.create({
      name: "Platform Admin",
      email: "admin@novashop.test",
      password: await hashPassword("AdminPass123!"),
      role: "ADMIN",
    });
    console.log("Created admin: admin@novashop.test / AdminPass123!");
  }
  return admin;
}

async function ensureCategories(): Promise<ICategory[]> {
  const categories: ICategory[] = [];
  for (const seed of CATEGORY_SEED) {
    const slug = slugify(seed.name);
    let category = await Category.findOne({ slug });
    if (!category) {
      category = await Category.create({ name: seed.name, slug, icon: seed.icon });
    }
    categories.push(category);
  }
  console.log(`Ensured ${categories.length} categories`);
  return categories;
}

async function ensureSellers(adminActor: { id: string; role: "ADMIN" }, categories: ICategory[]) {
  const categoryByName = new Map(categories.map((category) => [category.name, category]));
  const sellers: { user: IUser; categories: ICategory[] }[] = [];

  for (const seed of SELLER_SEED) {
    const sellerCategories = seed.categoryNames
      .map((name) => categoryByName.get(name))
      .filter((category): category is ICategory => Boolean(category));

    let user = await User.findOne({ email: seed.email });
    if (!user) {
      const result = await createSeller(adminActor, {
        firstName: seed.firstName,
        lastName: seed.lastName,
        email: seed.email,
        phone: `+234${Math.floor(700000000 + Math.random() * 99999999)}`,
        categories: sellerCategories.map((category) => category._id.toString()),
        storeName: seed.storeName,
        bio: `${seed.storeName} - quality products you can trust.`,
      });
      user = result.user;
      console.log(`Created seller: ${seed.email} / ${result.defaultPassword}`);
    }
    sellers.push({ user, categories: sellerCategories });
  }

  return sellers;
}

async function ensureProducts(sellers: { user: IUser; categories: ICategory[] }[]) {
  const products = [];
  for (const seed of PRODUCT_SEED) {
    const seller = sellers[seed.sellerIndex];
    const slug = slugify(seed.name);

    let product: IProduct | null = await Product.findOne({ slug });

    if (!product) {
      product = await createProduct(
        { id: seller.user._id.toString(), role: "SELLER" },
        {
          name: seed.name,
          description: `${seed.name} - a top pick from our ${seed.brand} collection. Carefully selected for quality and value.`,
          price: seed.price,
          discountPrice: seed.discountPrice,
          stock: Math.floor(5 + Math.random() * 50),
          sku: slug.toUpperCase(),
          category: seller.categories[0]._id.toString(),
          brand: seed.brand,
          tags: [seed.brand.toLowerCase()],
          images: [{ url: "/placeholder-product.svg", altText: seed.name, isPrimary: true }],
          isFeatured: Boolean(seed.isFeatured),
          isTrending: Boolean(seed.isTrending),
          isRecommended: Boolean(seed.isRecommended),
        }
      );
    }
    products.push(product);
  }
  console.log(`Ensured ${products.length} products`);
  return products;
}

async function ensureCustomers() {
  const customers: IUser[] = [];
  for (const seed of CUSTOMER_SEED) {
    let user = await User.findOne({ email: seed.email });
    if (!user) {
      user = await User.create({
        name: seed.name,
        email: seed.email,
        password: await hashPassword("CustomerPass123!"),
        role: "CUSTOMER",
      });
      await CustomerProfile.create({ user: user._id, addresses: [] });
      console.log(`Created customer: ${seed.email} / CustomerPass123!`);
    }
    customers.push(user);
  }
  return customers;
}

async function ensureDemoOrders(
  customers: IUser[],
  products: Awaited<ReturnType<typeof ensureProducts>>
) {
  const existingOrders = await Order.countDocuments({});
  if (existingOrders > 0 || products.length === 0) return;

  for (const customer of customers) {
    const actor = { id: customer._id.toString(), role: "CUSTOMER" as const };
    const pickCount = 2 + Math.floor(Math.random() * 2);
    const picked = [...products].sort(() => Math.random() - 0.5).slice(0, pickCount);

    for (const product of picked) {
      await addToCart(actor, product._id.toString(), 1 + Math.floor(Math.random() * 2));
    }

    await createOrderFromCart(actor, {
      line1: "12 Demo Street",
      line2: "",
      city: "Lagos",
      state: "Lagos",
      postalCode: "100001",
      country: "Nigeria",
      phone: "+2348012345678",
    });
  }
  console.log(`Created demo orders for ${customers.length} customers`);
}

async function ensureReviews(customers: IUser[], products: Awaited<ReturnType<typeof ensureProducts>>) {
  if (products.length === 0) return;

  for (const customer of customers) {
    const actor = { id: customer._id.toString(), role: "CUSTOMER" as const };
    const product = products[Math.floor(Math.random() * products.length)];

    const existing = await Review.findOne({ product: product._id, customer: customer._id });
    if (existing) continue;

    await createReview(actor, {
      product: product._id.toString(),
      rating: 4 + Math.floor(Math.random() * 2),
      comment: "Great quality and fast delivery. Highly recommend this product!",
    }).catch(() => undefined);
  }
}

async function main() {
  await connectToDatabase();
  console.log("Seeding database...");

  const admin = await ensureAdmin();
  const adminActor = { id: admin._id.toString(), role: "ADMIN" as const };

  const categories = await ensureCategories();
  const sellers = await ensureSellers(adminActor, categories);
  const products = await ensureProducts(sellers);
  const customers = await ensureCustomers();
  await ensureDemoOrders(customers, products);
  await ensureReviews(customers, products);

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
