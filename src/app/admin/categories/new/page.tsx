import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Add Category | Admin" };

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add Category</h1>
      <div className="max-w-xl">
        <CategoryForm />
      </div>
    </div>
  );
}
