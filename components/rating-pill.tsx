"use client";

import { Star } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

interface RatingPillProps {
  averageRating?: number | null;
  reviewCount?: number;
  className?: string;
  emptyLabel?: string;
}

export function RatingPill({
  averageRating,
  reviewCount = 0,
  className,
  emptyLabel = "No reviews yet",
}: RatingPillProps) {
  if (!reviewCount || !averageRating) {
    return (
      <StatusBadge tone="neutral" className={cn("text-xs", className)}>
        {emptyLabel}
      </StatusBadge>
    );
  }

  return (
    <StatusBadge
      tone="warning"
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      <Star className="h-3.5 w-3.5 fill-current" />
      <span>
        {averageRating.toFixed(1)} ({reviewCount})
      </span>
    </StatusBadge>
  );
}
