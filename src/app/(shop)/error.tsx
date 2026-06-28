"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/states/error-state";

export default function ShopError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="We couldn't load this page"
      message="Something went wrong while loading the storefront."
      onRetry={reset}
    />
  );
}
