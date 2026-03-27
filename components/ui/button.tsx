import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border text-sm font-semibold tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/20",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/95 hover:shadow-xl hover:shadow-destructive/20",
        outline:
          "border-border/70 bg-background/70 text-foreground shadow-sm hover:border-primary/35 hover:bg-primary/[0.06]",
        secondary: "border-border/70 bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary",
        ghost: "border-transparent bg-transparent text-foreground shadow-none hover:bg-secondary/65 hover:text-foreground",
      },
      // Heights are set as "min" heights, because sometimes Ai will place large amount of content
      // inside buttons. With a min-height they will look appropriate with small amounts of content,
      // but will expand to fit large amounts of content.
      size: {
        default: "min-h-11 px-4 py-2.5 md:min-h-10",
        sm: "min-h-10 rounded-xl px-3.5 text-xs md:min-h-9 md:rounded-lg",
        lg: "min-h-12 rounded-2xl px-8 text-sm md:min-h-11 md:rounded-xl",
        icon: "h-11 w-11 rounded-2xl md:h-10 md:w-10 md:rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-testid="button"
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
