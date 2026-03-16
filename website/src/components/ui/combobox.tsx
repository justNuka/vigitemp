"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTranslations } from "next-intl";

export type ComboboxOption = {
  value: string;
  label: string;
  searchText?: string;
  disabled?: boolean;
  className?: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  triggerId?: string;
};

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  className,
  buttonClassName,
  triggerId,
}: ComboboxProps) {
  const t = useTranslations("combobox");
  const resolvedPlaceholder = placeholder ?? t("placeholder");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("search_placeholder");
  const resolvedEmptyMessage = emptyMessage ?? t("empty_message");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, " ");
    if (!normalizedQuery) return options;

    return options.filter((option) => {
      const haystack = `${option.label} ${option.searchText ?? ""}`
        .toLowerCase()
        .replace(/\s+/g, " ");
      return haystack.includes(normalizedQuery);
    });
  }, [options, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={triggerId}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", buttonClassName)}
          disabled={disabled}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.label ?? resolvedPlaceholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0 max-h-72 overflow-hidden", className)}
        align="center"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={resolvedSearchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-60 overscroll-contain" onWheel={(event) => event.stopPropagation()}>
            {filteredOptions.length === 0 ? (
              <CommandEmpty>{resolvedEmptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    className={option.className}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    disabled={option.disabled}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
