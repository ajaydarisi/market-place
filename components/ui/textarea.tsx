import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[128px] w-full rounded-2xl border border-input/80 bg-background/75 px-4 py-3 text-base text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground/80 transition-[border-color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary/40 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[110px] md:text-sm",
        className
      )}
      ref={ref}
      data-testid="textarea"
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
