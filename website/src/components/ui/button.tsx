import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out",
    "active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-sm hover:bg-primary/90 active:bg-primary/85 dark:text-primary-foreground",
        default:
          "bg-primary text-white shadow-sm hover:bg-primary/90 active:bg-primary/85 dark:text-primary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/85",
        outline:
          "border border-border bg-card text-foreground shadow-sm hover:border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--surface-muted))] active:bg-[hsl(var(--surface-sunken))]",
        secondary:
          "border border-border bg-card text-foreground shadow-sm hover:border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--surface-muted))] active:bg-[hsl(var(--surface-sunken))]",
        ghost:
          "border border-transparent bg-transparent text-muted-foreground hover:bg-[hsl(var(--surface-sunken)/0.70)] hover:text-foreground active:bg-[hsl(var(--surface-sunken))]",
        link:
          "h-auto rounded-md p-0 font-normal text-[hsl(var(--primary-strong))] underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "h-8 px-3 text-[13px] [&_svg]:h-4 [&_svg]:w-4",
        sm: "h-7 px-2.5 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5",
        lg: "h-9 px-5 text-sm [&_svg]:h-4 [&_svg]:w-4",
        icon: "h-8 w-8 p-0 [&_svg]:h-4 [&_svg]:w-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants }
