import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90',
        default:
          "border border-[hsl(var(--control-ghost-border))] bg-[hsl(var(--control-ghost-bg))] text-[hsl(var(--control-ghost-foreground))] shadow-xs hover:bg-[hsl(var(--control-ghost-bg-hover))] active:bg-[hsl(var(--control-ghost-bg-active))] focus-visible:ring-[hsl(var(--control-ghost-ring))]",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive-border hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          // Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color.
          "border border-[hsl(var(--control-ghost-border))] bg-[hsl(var(--control-ghost-bg))] text-[hsl(var(--control-ghost-foreground))] shadow-xs hover:bg-[hsl(var(--control-ghost-bg-hover))] active:bg-[hsl(var(--control-ghost-bg-active))] focus-visible:ring-[hsl(var(--control-ghost-ring))]",
        link: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive underline-offset-4 hover:underline has-[>svg]:px-3 text-primary p-0 h-auto font-normal",
        secondary: "border border-[hsl(var(--control-ghost-border))] bg-[hsl(var(--control-ghost-bg))] text-[hsl(var(--control-ghost-foreground))] shadow-xs hover:bg-[hsl(var(--control-ghost-bg-hover))] active:bg-[hsl(var(--control-ghost-bg-active))] focus-visible:ring-[hsl(var(--control-ghost-ring))]",
        // Add a transparent border so that when someone toggles a border on later, it doesn't shift layout/size.
        ghost: "border border-transparent bg-transparent text-[hsl(var(--control-ghost-foreground))] hover:bg-[hsl(var(--control-ghost-bg))] active:bg-[hsl(var(--control-ghost-bg-hover))]",
      },
      // Heights are set as "min" heights, because sometimes Ai will place large amount of content
      // inside buttons. With a min-height they will look appropriate with small amounts of content,
      // but will expand to fit large amounts of content.
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-9 w-9",
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