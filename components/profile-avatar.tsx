"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  xs: "h-7 w-7",
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
} as const;

const textSizeClasses = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
} as const;

type ProfileAvatarSize = keyof typeof sizeClasses;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

interface ProfileAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: ProfileAvatarSize;
  className?: string;
}

export function ProfileAvatar({
  name,
  imageUrl,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const initials = getInitials(name) || "?";

  return (
    <Avatar
      key={`${name}-${imageUrl || "no-img"}`}
      className={cn(sizeClasses[size], className)}
      aria-label={`${name}'s avatar`}
    >
      {imageUrl && <AvatarImage src={imageUrl} alt={`${name}'s photo`} />}
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-primary font-semibold",
          textSizeClasses[size]
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
