"use client"

import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  className,
  tone = "default",
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
  className?: string
  tone?: "default" | "soft"
  disabled?: boolean
}) {
  return (
    <div className={cn("group/search relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--subtle-foreground))] transition-colors duration-150 group-focus-within/search:text-[hsl(var(--primary-strong))]"
      />
      <input
        type="search"
        aria-label={label ?? placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-8 w-full rounded-md border pl-8 pr-8 text-[13px] text-foreground placeholder:text-[hsl(var(--subtle-foreground))] [&::-webkit-search-cancel-button]:hidden",
          "transition-[background-color,border-color,box-shadow] duration-150 ease-out focus:outline-none focus:ring-[3px] focus:ring-ring/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
          tone === "soft"
            ? "border-primary/15 bg-[hsl(var(--primary-soft)/0.70)] hover:border-primary/30 focus:border-ring focus:bg-card"
            : "border-border bg-card shadow-sm hover:border-[hsl(var(--border-strong))] focus:border-ring",
        )}
      />
      {value && !disabled ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer"
          className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-[hsl(var(--subtle-foreground))] transition-colors duration-150 hover:bg-[hsl(var(--surface-sunken))] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
