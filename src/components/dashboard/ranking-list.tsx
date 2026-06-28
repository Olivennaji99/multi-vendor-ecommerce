export interface RankingItem {
  label: string;
  value: number;
}

export function RankingList({
  items,
  formatValue,
}: {
  items: RankingItem[];
  formatValue?: (value: number) => string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-3">
          <span className="w-5 text-xs font-medium text-muted-foreground">{index + 1}</span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="line-clamp-1 font-medium">{item.label}</span>
              <span className="text-muted-foreground">
                {formatValue ? formatValue(item.value) : item.value}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
