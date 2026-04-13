import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwitchWithLoadingProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  isLoading?: boolean;
}

const SwitchWithLoading = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchWithLoadingProps
>(({ className, isLoading = false, disabled, ...props }, ref) => {
  const isDisabled = disabled || isLoading;

  return (
    <div className="relative inline-flex items-center">
      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          isLoading && "opacity-60 cursor-wait",
          className
        )}
        disabled={isDisabled}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none relative flex items-center justify-center h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )}
        >
          {isLoading && (
            <Loader2 className="h-3 w-3 animate-spin text-primary absolute" />
          )}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    </div>
  );
});

SwitchWithLoading.displayName = "SwitchWithLoading";

export { SwitchWithLoading };
