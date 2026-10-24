import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-colors focus:outline-none [&>svg]:size-3 gap-1 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-white/15 bg-white/10 text-white",
        secondary:
          "border-white/10 bg-white/5 text-white/80",
        destructive:
          "border-red-500/30 bg-red-500/15 text-red-300",
        outline:
          "border-white/20 text-white bg-transparent",
        glass:
          "border-white/15 bg-white/5 text-white/90",
        amber:
          "border-amber-400/25 bg-amber-400/10 text-amber-300",
        blue:
          "border-sky-400/25 bg-sky-400/10 text-sky-300",
        purple:
          "border-purple-400/25 bg-purple-400/10 text-purple-300",
        emerald:
          "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
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
