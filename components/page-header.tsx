import * as React from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  centered?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
  centered = false,
  titleClassName,
  descriptionClassName,
  ...props
}: PageHeaderProps) {
  return (
    <Card
      className={cn("surface-glass mobile-panel overflow-hidden border-primary/10", className)}
      {...props}
    >
      <CardHeader className="gap-5">
        <div
          className={cn(
            "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
            centered && "items-center text-center",
          )}
        >
          <div className={cn("min-w-0 space-y-2", centered && "max-w-3xl")}>
            {eyebrow ? <div className={cn(centered && "mx-auto")}>{eyebrow}</div> : null}
            <CardTitle className={cn("mobile-section-title", titleClassName)}>{title}</CardTitle>
            {description ? (
              <CardDescription className={cn("mobile-copy", descriptionClassName)}>
                {description}
              </CardDescription>
            ) : null}
          </div>
          {actions ? <div className={cn("shrink-0", centered && "w-full")}>{actions}</div> : null}
        </div>
        {children ? <div>{children}</div> : null}
      </CardHeader>
    </Card>
  );
}
