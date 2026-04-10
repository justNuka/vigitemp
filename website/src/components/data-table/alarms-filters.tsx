"use client";

import { useTranslations } from "next-intl";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AlarmType = "high" | "low" | "no-response" | "sector" | "temperature";

type AlarmsFiltersProps = {
  typeFilters: AlarmType[];
  onToggleTypeFilter: (type: AlarmType, checked: boolean) => void;
  onClearTypeFilters: () => void;
};

export function AlarmsFilters({
  typeFilters,
  onToggleTypeFilter,
  onClearTypeFilters,
}: AlarmsFiltersProps) {
  const t = useTranslations("alarmsTanstack");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-filter-type"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{t("filters.type_label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("filters.type_label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={typeFilters.length === 0}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => {
            if (checked) onClearTypeFilters();
          }}
        >
          {t("filters.all")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilters.includes("high")}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => onToggleTypeFilter("high", checked === true)}
        >
          {t("filters.high")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilters.includes("low")}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => onToggleTypeFilter("low", checked === true)}
        >
          {t("filters.low")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilters.includes("no-response")}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => onToggleTypeFilter("no-response", checked === true)}
        >
          {t("filters.no_response")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={typeFilters.includes("sector")}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(checked) => onToggleTypeFilter("sector", checked === true)}
        >
          {t("filters.sector")}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
