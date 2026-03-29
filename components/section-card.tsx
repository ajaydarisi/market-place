import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerActions?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionCard({
  title,
  description,
  headerActions,
  children,
  className,
  headerClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
  ...props
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || headerActions);

  return (
    <Card className={cn("surface-glass border-border/60", className)} {...props}>
      {hasHeader ? (
        <CardHeader
          className={cn(
            "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
            headerClassName,
          )}
        >
          <div className="min-w-0 space-y-1.5">
            {title ? <CardTitle className={cn("min-w-0", titleClassName)}>{title}</CardTitle> : null}
            {description ? (
              <CardDescription className={cn("min-w-0", descriptionClassName)}>
                {description}
              </CardDescription>
            ) : null}
          </div>
          {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
        </CardHeader>
      ) : null}

      {children ? <CardContent className={contentClassName}>{children}</CardContent> : null}
    </Card>
  );
}
