import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionListItemProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  trailing?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
}

function ActionListItemContent({
  title,
  description,
  icon: Icon,
  trailing,
}: Pick<ActionListItemProps, "title" | "description" | "icon" | "trailing">) {
  return (
    <>
      <div className="flex min-w-0 items-start gap-3 text-left">
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pastel-blue/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
        <div className="min-w-0 space-y-1">
          <div className="truncate font-medium">{title}</div>
          {description ? <div className="text-sm font-normal text-muted-foreground">{description}</div> : null}
        </div>
      </div>
      <div className="shrink-0 text-muted-foreground">{trailing ?? <ChevronRight className="h-4 w-4" />}</div>
    </>
  );
}

export function ActionListItem({
  title,
  description,
  href,
  onClick,
  icon,
  trailing,
  className,
  ariaLabel,
  target,
  rel,
}: ActionListItemProps) {
  const classes = cn(
    "h-auto w-full justify-between rounded-2xl border border-transparent px-3 py-3 hover:border-primary/15 hover:bg-secondary/60",
    className,
  );

  if (href) {
    return (
      <Button asChild variant="ghost" className={classes} aria-label={ariaLabel}>
        <Link href={href} onClick={onClick} target={target} rel={rel}>
          <ActionListItemContent
            title={title}
            description={description}
            icon={icon}
            trailing={trailing}
          />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={classes}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <ActionListItemContent
        title={title}
        description={description}
        icon={icon}
        trailing={trailing}
      />
    </Button>
  );
}
