import React from "react"
import { motion, type HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/utils"

interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className,
  spotlightColor,
  ...props
}: SpotlightCardProps) {
  void spotlightColor;
  return (
    <motion.div
      whileHover={{ y: -1, transition: { duration: 0.18 } }}
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-card p-5 text-card-foreground transition-colors hover:border-primary/40 hover:bg-accent/40",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
