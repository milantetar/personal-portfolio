import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-border bg-muted text-foreground",
        secondary:
          "border-border bg-transparent text-muted-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive",
        outline:
          "border-border text-muted-foreground",
        glass:
          "border-border bg-card text-foreground",
        amber:
          "border-primary/25 bg-primary/10 text-primary",
        blue:
          "border-primary/25 bg-primary/10 text-primary",
        purple:
          "border-primary/25 bg-primary/10 text-primary",
        emerald:
          "border-primary/25 bg-primary/10 text-primary",
      },
    },
    defaultVariants: {
      variant: "glass",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
