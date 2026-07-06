"use client";

import Link from "next/link";
import { Briefcase, RefreshCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="surface-glass w-full max-w-md text-center">
        <CardContent className="p-8 md:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-7 w-7" />
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/55 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            Offline Mode
          </div>
          <h1 className="text-2xl font-display font-bold">You&apos;re offline</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            SkillPilot&apos;s app shell is still available, but live project data and messages need a connection before they can refresh.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
