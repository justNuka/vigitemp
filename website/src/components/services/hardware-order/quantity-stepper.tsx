"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type QuantityStepperProps = {
  value: number
  min?: number
  max?: number
  className?: string
  onChange: (value: number) => void
}

export function QuantityStepper({
  value,
  min = 0,
  max = 999,
  className,
  onChange,
}: QuantityStepperProps) {
  const clamp = (next: number) => Math.max(min, Math.min(max, next))

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-background/95 shadow-sm",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-r-none border-r border-border"
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value || 0)))}
        className="h-10 w-14 rounded-none border-0 px-1 text-center text-sm font-semibold shadow-none focus-visible:ring-0"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-l-none border-l border-border"
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
