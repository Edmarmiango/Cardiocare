"use client"

import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const chartVariants = cva("", {
  variants: {
    variant: {
      default: "text-primary",
      secondary: "text-secondary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface ChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  config: Record<string, { label: string; color: string }>
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, variant, config, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chartVariants({ variant }), className)}
        {...props}
        style={
          {
            ...Object.fromEntries(
              Object.entries(config).map(([key, value]) => [
                `--color-${key}`,
                value.color,
              ])
            ),
            ...props.style,
          } as React.CSSProperties
        }
      />
    )
  }
)
Chart.displayName = "Chart"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute rounded-lg border bg-background px-3 py-2 text-sm shadow-md",
      className
    )}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
ChartTooltipContent.displayName = "ChartTooltipContent"

export { Chart as ChartContainer, ChartTooltip, ChartTooltipContent }

