import { Sparkles, Tag, Truck } from "lucide-react";
import Link from "next/link";

const tiles = [
  {
    title: "Flash Sale",
    description: "Limited time deals, up to 70% off",
    href: "/products?sort=price-asc",
    icon: Tag,
    accent: "bg-brand-red/10 text-brand-red",
  },
  {
    title: "Free Shipping",
    description: "On orders over ₦50,000",
    href: "/products",
    icon: Truck,
    accent: "bg-success/10 text-success",
  },
  {
    title: "New Arrivals",
    description: "Check out the latest trends",
    href: "/products?sort=newest",
    icon: Sparkles,
    accent: "bg-primary/10 text-primary",
  },
];

export function PromoTiles() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <Link
            key={tile.title}
            href={tile.href}
            className="flex items-center gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md"
          >
            <span className={`flex size-10 items-center justify-center rounded-lg ${tile.accent}`}>
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold">{tile.title}</p>
              <p className="text-xs text-muted-foreground">{tile.description}</p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
