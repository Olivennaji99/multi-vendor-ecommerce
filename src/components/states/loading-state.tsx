import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingState({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function LoadingGrid({
  items = 8,
  className,
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: items }).map((_, index) => (
        <Skeleton key={index} className="aspect-[3/4] w-full rounded-xl" />
      ))}
    </div>
  );
}
