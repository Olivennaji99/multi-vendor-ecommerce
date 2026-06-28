import { LoadingGrid } from "@/components/states/loading-state";

export default function ShopLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-56 w-full animate-pulse rounded-2xl bg-muted" />
      <LoadingGrid items={8} />
    </div>
  );
}
