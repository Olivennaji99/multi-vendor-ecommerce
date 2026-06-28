import {
  Baby,
  Book,
  Dumbbell,
  Gem,
  Headphones,
  Home as HomeIcon,
  type LucideIcon,
  Package,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const ICONS: Record<string, LucideIcon> = {
  package: Package,
  shirt: Shirt,
  fashion: Shirt,
  beauty: Sparkles,
  electronics: Smartphone,
  gadgets: Smartphone,
  home: HomeIcon,
  "home-living": HomeIcon,
  sports: Dumbbell,
  books: Book,
  health: Gem,
  grocery: ShoppingBag,
  audio: Headphones,
  baby: Baby,
};

export interface CategoryIconGridItem {
  name: string;
  slug: string;
  icon: string;
}

export function CategoryIconGrid({ categories }: { categories: CategoryIconGridItem[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8">
      {categories.map((category) => {
        const Icon = ICONS[category.icon] ?? ICONS[category.slug] ?? Package;
        return (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-muted"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <span className="line-clamp-1 text-xs font-medium">{category.name}</span>
          </Link>
        );
      })}
    </section>
  );
}
