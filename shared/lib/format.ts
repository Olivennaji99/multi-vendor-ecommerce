export const CURRENCY_CODE = "NGN";
export const CURRENCY_LOCALE = "en-NG";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDate(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(CURRENCY_LOCALE, { dateStyle: "medium" }).format(parsed);
}
