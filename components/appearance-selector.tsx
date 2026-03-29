"use client";

import type { LucideIcon } from "lucide-react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ThemePreference = "system" | "light" | "dark";

type AppearanceDropdownProps = {
  align?: "start" | "center" | "end";
  buttonClassName?: string;
  buttonSize?: ButtonProps["size"];
  buttonVariant?: ButtonProps["variant"];
  contentClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
  triggerLabel?: string;
  triggerTestId?: string;
};

type AppearanceMenuItemsProps = {
  className?: string;
};

type AppearanceInlineSelectorProps = {
  className?: string;
};

type ThemeOption = {
  value: ThemePreference;
  label: string;
  description: string;
  icon: LucideIcon;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "system",
    label: "System",
    description: "Match your device appearance.",
    icon: Monitor,
  },
  {
    value: "light",
    label: "Light",
    description: "Brighter surfaces for daytime use.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Lower glare in dim environments.",
    icon: Moon,
  },
];

function normalizeTheme(value: string | undefined): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
}

function normalizeResolvedTheme(value: string | undefined): "light" | "dark" {
  return value === "dark" ? "dark" : "light";
}

function getResolvedThemeLabel(value: "light" | "dark") {
  return value === "dark" ? "Dark" : "Light";
}

function getTriggerIcon(
  selectedTheme: ThemePreference | undefined,
  resolvedTheme: "light" | "dark"
) {
  if (selectedTheme === "dark") {
    return Moon;
  }

  if (selectedTheme === "light") {
    return Sun;
  }

  if (selectedTheme === "system") {
    return resolvedTheme === "dark" ? Moon : Sun;
  }

  return Monitor;
}

function getThemeSummary(
  selectedTheme: ThemePreference | undefined,
  resolvedTheme: "light" | "dark"
) {
  if (!selectedTheme) {
    return "Theme";
  }

  if (selectedTheme === "system") {
    return `System (${getResolvedThemeLabel(resolvedTheme)})`;
  }

  return selectedTheme === "dark" ? "Dark" : "Light";
}

function useAppearanceState() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted ? normalizeTheme(theme) : undefined;
  const activeTheme = normalizeTheme(theme);
  const currentResolvedTheme = normalizeResolvedTheme(resolvedTheme);

  return {
    activeTheme,
    mounted,
    resolvedTheme: currentResolvedTheme,
    selectedTheme,
    setTheme: (nextTheme: ThemePreference) => setTheme(nextTheme),
  };
}

export function AppearanceMenuItems({ className }: AppearanceMenuItemsProps) {
  const { mounted, resolvedTheme, selectedTheme, setTheme } = useAppearanceState();

  return (
    <div className={className}>
      <div className="px-3 pb-1 pt-2">
        <DropdownMenuLabel className="px-0 py-0 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Appearance
        </DropdownMenuLabel>
        <p className="mt-1 text-xs text-muted-foreground">
          {mounted && selectedTheme
            ? selectedTheme === "system"
              ? `Following system: ${getResolvedThemeLabel(resolvedTheme)}`
              : `${getThemeSummary(selectedTheme, resolvedTheme)} mode active`
            : "Choose how DevMarket looks on this device."}
        </p>
      </div>

      {THEME_OPTIONS.map((option) => {
        const isActive = mounted && selectedTheme === option.value;
        const Icon = option.icon;

        return (
          <DropdownMenuItem
            key={option.value}
            aria-label={`Switch to ${option.label.toLowerCase()} theme`}
            className={cn(
              "items-start gap-3 py-3",
              isActive && "bg-primary/[0.08] text-foreground"
            )}
            data-testid={`appearance-option-${option.value}`}
            onSelect={() => setTheme(option.value)}
          >
            <Icon
              className={cn(
                "mt-0.5 h-4 w-4",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-none">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {option.value === "system" && mounted
                  ? `Match your device appearance. Currently ${getResolvedThemeLabel(resolvedTheme)}.`
                  : option.description}
              </p>
            </div>
            {isActive ? <Check className="mt-0.5 h-4 w-4 text-primary" /> : null}
          </DropdownMenuItem>
        );
      })}
    </div>
  );
}

export function AppearanceDropdown({
  align = "end",
  buttonClassName,
  buttonSize = "sm",
  buttonVariant = "outline",
  contentClassName,
  labelClassName = "hidden sm:inline",
  showLabel = true,
  triggerLabel = "Theme",
  triggerTestId = "appearance-trigger",
}: AppearanceDropdownProps) {
  const { activeTheme, mounted, resolvedTheme } = useAppearanceState();
  const TriggerIcon = getTriggerIcon(mounted ? activeTheme : undefined, resolvedTheme);
  const ariaLabel = mounted
    ? `Theme: ${getThemeSummary(activeTheme, resolvedTheme)}`
    : "Theme";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className={buttonClassName}
          data-testid={triggerTestId}
          size={buttonSize}
          type="button"
          variant={buttonVariant}
        >
          <TriggerIcon className="h-4 w-4" />
          {showLabel ? <span className={cn(labelClassName)}>{triggerLabel}</span> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("w-72", contentClassName)}>
        <AppearanceMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppearanceInlineSelector({
  className,
}: AppearanceInlineSelectorProps) {
  const { activeTheme, mounted, resolvedTheme, setTheme } = useAppearanceState();

  return (
    <div
      className={cn("grid grid-cols-3 gap-2", className)}
      data-testid="appearance-inline-selector"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = mounted && activeTheme === option.value;

        return (
          <Button
            key={option.value}
            aria-label={`Switch to ${option.label.toLowerCase()} theme`}
            aria-pressed={isActive}
            className={cn(
              "min-h-[4.5rem] flex-col gap-1 rounded-[1.15rem] border-border/70 px-3 py-3 text-xs font-semibold shadow-sm",
              isActive && "border-primary/35 bg-primary/[0.08] text-foreground"
            )}
            data-testid={`appearance-inline-${option.value}`}
            onClick={() => setTheme(option.value)}
            type="button"
            variant="outline"
          >
            <Icon
              className={cn(
                "h-4 w-4",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span>{option.label}</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {option.value === "system" && mounted
                ? getResolvedThemeLabel(resolvedTheme)
                : "\u00a0"}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
