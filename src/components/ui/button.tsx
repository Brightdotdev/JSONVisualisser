import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer select-none",
  {
    variants: {
      variant: {
        // Original shadcn variants
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 dark:hover:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 dark:hover:bg-destructive/70",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 dark:hover:bg-secondary/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        // New Semantic Variants
        success: 
          "bg-success text-success-foreground shadow-xs hover:bg-success/90 dark:hover:bg-success/80 focus-visible:ring-success/20 dark:focus-visible:ring-success/40",
        warning: 
          "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90 dark:hover:bg-warning/80 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40",
        info: 
          "bg-info text-info-foreground shadow-xs hover:bg-info/90 dark:hover:bg-info/80 focus-visible:ring-info/20 dark:focus-visible:ring-info/40",
        progress: 
          "bg-progress text-progress-foreground shadow-xs hover:bg-progress/90 dark:hover:bg-progress/80 focus-visible:ring-progress/20 dark:focus-visible:ring-progress/40",

        // New Alternate Color Variants
        alt1: 
          "bg-alt1 text-foreground shadow-xs hover:bg-alt1/90 dark:hover:bg-alt1/80 focus-visible:ring-alt1/20 dark:focus-visible:ring-alt1/40",
        alt2: 
          "bg-alt2 text-foreground shadow-xs hover:bg-alt2/90 dark:hover:bg-alt2/80 focus-visible:ring-alt2/20 dark:focus-visible:ring-alt2/40",
        alt3: 
          "bg-alt3 text-foreground shadow-xs hover:bg-alt3/90 dark:hover:bg-alt3/80 focus-visible:ring-alt3/20 dark:focus-visible:ring-alt3/40",
        alt4: 
          "bg-alt4 text-foreground shadow-xs hover:bg-alt4/90 dark:hover:bg-alt4/80 focus-visible:ring-alt4/20 dark:focus-visible:ring-alt4/40",
        alt5: 
          "bg-alt5 text-foreground shadow-xs hover:bg-alt5/90 dark:hover:bg-alt5/80 focus-visible:ring-alt5/20 dark:focus-visible:ring-alt5/40",

        // Outline variants for semantic colors
        "outline-success":
          "border border-success-border bg-success-subtle text-success-foreground hover:bg-success hover:text-success-foreground dark:bg-success-subtle/30 dark:border-success-border/50",
        "outline-warning":
          "border border-warning-border bg-warning-subtle text-warning-foreground hover:bg-warning hover:text-warning-foreground dark:bg-warning-subtle/30 dark:border-warning-border/50",
        "outline-info":
          "border border-info-border bg-info-subtle text-info-foreground hover:bg-info hover:text-info-foreground dark:bg-info-subtle/30 dark:border-info-border/50",
        "outline-progress":
          "border border-progress-border bg-progress-subtle text-progress-foreground hover:bg-progress hover:text-progress-foreground dark:bg-progress-subtle/30 dark:border-progress-border/50",

        // Ghost variants for semantic colors
        "ghost-success":
          "hover:bg-success-subtle text-success-foreground hover:text-success-foreground dark:hover:bg-success-subtle/30",
        "ghost-warning":
          "hover:bg-warning-subtle text-warning-foreground hover:text-warning-foreground dark:hover:bg-warning-subtle/30",
        "ghost-info":
          "hover:bg-info-subtle text-info-foreground hover:text-info-foreground dark:hover:bg-info-subtle/30",
        "ghost-progress":
          "hover:bg-progress-subtle text-progress-foreground hover:text-progress-foreground dark:hover:bg-progress-subtle/30",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Extended type for the new variants
interface ButtonProps extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }