import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "border-border/70 bg-secondary/70 text-secondary-foreground",
  info: "border-primary/20 bg-primary/[0.08] text-primary",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  destructive: "border-destructive/25 bg-destructive/10 text-destructive",
} as const;

interface StatusBadgeProps extends React.ComponentPropsWithoutRef<typeof Badge> {
  tone?: keyof typeof toneClasses;
}

export function StatusBadge({
  tone = "neutral",
  className,
  variant = "outline",
  ...props
}: StatusBadgeProps) {
  return <Badge variant={variant} className={cn(toneClasses[tone], className)} {...props} />;
}
