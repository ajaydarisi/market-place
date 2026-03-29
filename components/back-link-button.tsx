import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackLinkButtonProps extends Omit<ButtonProps, "children"> {
  href?: string;
  children?: React.ReactNode;
}

export function BackLinkButton({
  href,
  onClick,
  className,
  children = "Back",
  ...props
}: BackLinkButtonProps) {
  const classes = cn(
    "surface-glass w-fit text-muted-foreground hover:text-primary",
    className,
  );

  if (href) {
    return (
      <Button asChild variant="ghost" size="sm" className={classes} {...props}>
        <Link href={href}>
          <ArrowLeft className="h-4 w-4" />
          {children}
        </Link>
      </Button>
    );
  }

  return (
    <Button type="button" variant="ghost" size="sm" className={classes} onClick={onClick} {...props}>
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
}
