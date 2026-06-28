"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 px-8 py-12 text-primary-foreground sm:px-12"
    >
      <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
        New Collection
      </span>
      <h1 className="mt-4 max-w-md text-3xl font-bold tracking-tight sm:text-4xl">
        Find Your Style, Love Your Look
      </h1>
      <p className="mt-3 max-w-sm text-sm text-primary-foreground/80">
        Discover the latest trends in fashion, beauty, electronics and lifestyle.
      </p>
      <Button
        size="lg"
        variant="secondary"
        className="mt-6"
        render={<Link href="/products">Shop Now</Link>}
      />
    </motion.div>
  );
}
