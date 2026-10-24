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
  ...props
}: SpotlightCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-black/40",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
