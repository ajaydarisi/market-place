"use client";

import { Button } from "@/components/ui/button";
import { PoweredByDarisi } from "@/components/powered-by-darisi";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="border-t border-border/55 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-auto px-0 font-display text-base font-bold tracking-tight hover:bg-transparent"
          >
            <Link href="/" aria-label="Go to DevMarket home">
              Dev<span className="text-gradient">Market</span>
            </Link>
          </Button>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            © {new Date().getFullYear()} DevMarket. All rights reserved.
          </p>
        </div>
        <div className="mt-2 flex justify-center sm:justify-end">
          <PoweredByDarisi />
        </div>
      </div>
    </footer>
  );
}
