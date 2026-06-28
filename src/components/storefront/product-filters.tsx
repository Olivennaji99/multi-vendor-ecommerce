"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CategoryOption {
  name: string;
  slug: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

export function ProductFilters({
  categories,
  hideCategoryFilter,
}: {
  categories: CategoryOption[];
  hideCategoryFilter?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4">
      {!hideCategoryFilter && (
        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(value) => updateParam("category", !value || value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Input
        type="number"
        placeholder="Min price"
        defaultValue={searchParams.get("minPrice") ?? ""}
        onBlur={(event) => updateParam("minPrice", event.target.value)}
        className="w-32"
      />
      <Input
        type="number"
        placeholder="Max price"
        defaultValue={searchParams.get("maxPrice") ?? ""}
        onBlur={(event) => updateParam("maxPrice", event.target.value)}
        className="w-32"
      />
      <Select
        value={searchParams.get("sort") ?? "newest"}
        onValueChange={(value) => updateParam("sort", value ?? "newest")}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
