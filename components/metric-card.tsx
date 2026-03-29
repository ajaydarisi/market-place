import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value?: React.ReactNode;
  description?: React.ReactNode;
  icon: LucideIcon;
  href?: string;
  loading?: boolean;
  iconClassName?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  loading = false,
  className,
  iconClassName,
  ...props
}: MetricCardProps) {
  const card = (
    <Card
      className={cn(
        "surface-glass h-full border-border/60 transition-all duration-300 hover:border-primary/40 hover:shadow-xl",
        href && "cursor-pointer",
        className,
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/[0.08]">
          <Icon className={cn("h-4 w-4 text-primary", iconClassName)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} aria-label={`View ${title}`} className="block h-full">
      {card}
    </Link>
  );
}
