"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { PWAProvider } from "@/components/pwa-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider data-testid="providers" client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
        storageKey="devmarket-theme"
      >
        <TooltipProvider>
          <PWAProvider>{children}</PWAProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
