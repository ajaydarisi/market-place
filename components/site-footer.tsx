"use client";

import { PoweredByDarisi } from "@/components/powered-by-darisi";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="border-t border-border/55 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <Link href="/" aria-label="Go to DevMarket home" className="font-display text-lg font-bold tracking-tight">
            Dev<span className="text-primary">Market</span>
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} DevMarket. All rights reserved.
          </p>
        </div>
        <div className="mt-4 flex justify-center sm:justify-end">
          <PoweredByDarisi />
        </div>
      </div>
    </footer>
  );
}
