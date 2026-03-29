"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PROJECT_CATEGORY_OPTIONS } from "@shared/marketplace";
import { cn } from "@/lib/utils";

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
}

export function CategoryMultiSelect({
  value,
  onChange,
  className,
}: CategoryMultiSelectProps) {
  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={onChange}
      className={cn("flex flex-wrap justify-start gap-2", className)}
      aria-label="Project categories"
    >
      {PROJECT_CATEGORY_OPTIONS.map((option) => {
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-all",
              "data-[state=on]:border-primary data-[state=on]:bg-primary/[0.08] data-[state=on]:text-primary",
            )}
          >
            {option.label}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
