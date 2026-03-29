import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  contentClassName?: string;
}

export function FilterBar({
  children,
  className,
  contentClassName,
  ...props
}: FilterBarProps) {
  return (
    <Card className={cn("surface-glass border-border/60", className)} {...props}>
      <CardContent className={cn("p-4 md:p-5", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
