import { cn } from "@/lib/utils"

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  borderWidth?: number
  anchor?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
}

export function BorderBeam({ className }: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-border", className)}
    />
  )
}

