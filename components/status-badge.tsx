import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "border-border/70 bg-secondary/70 text-secondary-foreground",
  info: "border-primary/20 bg-primary/[0.08] text-primary",
  success: "border-status-online/30 bg-status-online/15 text-status-online",
  warning: "border-status-away/30 bg-status-away/15 text-status-away",
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
