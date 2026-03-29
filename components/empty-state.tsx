import * as React from "react";

import { LucideIcon } from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <SectionCard
      className={cn("border-2 border-dashed border-border/60", className)}
      contentClassName="flex flex-col items-center justify-center gap-4 py-16 text-center"
      {...props}
    >
      {Icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/[0.08] text-primary">
          <Icon className="h-8 w-8" />
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        {description ? <p className="mx-auto max-w-md text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </SectionCard>
  );
}
