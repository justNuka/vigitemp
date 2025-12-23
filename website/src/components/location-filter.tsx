import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X, Filter } from "lucide-react";
import type { Location } from "@/lib/api";

interface LocationFilterProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationChange: (locationId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  siteGroups: string[];
  selectedSiteGroup: string | null;
  onSiteGroupChange: (group: string | null) => void;
  className?: string;
}

export function LocationFilter({
  locations,
  selectedLocationId,
  onLocationChange,
  searchQuery,
  onSearchChange,
  siteGroups,
  selectedSiteGroup,
  onSiteGroupChange,
  className,
}: LocationFilterProps) {
  const hasFilters = selectedLocationId || searchQuery || selectedSiteGroup;

  const clearFilters = () => {
    onLocationChange(null);
    onSearchChange("");
    onSiteGroupChange(null);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher une sonde..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Rechercher une sonde"
          className="pl-9 pr-9"
          data-testid="input-search-sensors"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange("")}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Effacer la recherche</span>
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {siteGroups.length > 0 && (
          <Select
            value={selectedSiteGroup || "all"}
            onValueChange={(v) => onSiteGroupChange(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-[180px]" data-testid="select-site-group">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Groupe de sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les groupes</SelectItem>
              {siteGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={selectedLocationId || "all"}
          onValueChange={(v) => onLocationChange(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[200px]" data-testid="select-location">
            <SelectValue placeholder="Tous les lieux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les lieux</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2"
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Effacer</span>
          </Button>
        )}
      </div>
    </div>
  );
}
