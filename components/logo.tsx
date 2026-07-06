import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showIcon?: boolean;
  iconSize?: string;
  textSize?: string;
}

export function Logo({
  className = "",
  showIcon = true,
  iconSize = "h-4 w-4",
  textSize = "text-lg md:text-xl",
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Briefcase className={iconSize} />
        </div>
      )}
      <span className={cn("font-display font-semibold tracking-tight text-primary", textSize)}>
        SkillPilot
      </span>
    </div>
  );
}
