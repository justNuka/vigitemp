'use client';

import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  id: number | string;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: Option[];
  selectedIds: (number | string)[];
  onChange: (selectedIds: (number | string)[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = 'Sélectionner...',
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id: number | string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((selected) => selected !== id)
      : [...selectedIds, id];
    onChange(newSelection);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = options
    .filter((opt) => selectedIds.includes(opt.id))
    .map((opt) => opt.label);

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          <span className="text-sm font-medium">{label}</span>
          {selectedIds.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {selectedIds.length}
            </Badge>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 border border-input bg-popover rounded-md shadow-md p-2">
          {/* Afficher les sélections actuelles */}
          {selectedLabels.length > 0 && (
            <div className="mb-3 pb-3 border-b flex flex-wrap gap-1">
              {selectedLabels.map((label) => (
                <Badge key={label} variant="default" className="flex items-center gap-1">
                  {label}
                  <X
                    className="h-3 w-3 cursor-pointer hover:opacity-70"
                    onClick={() =>
                      handleToggle(options.find((opt) => opt.label === label)?.id!)
                    }
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Options */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Aucune option</p>
            ) : (
              options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(option.id)}
                    onCheckedChange={() => handleToggle(option.id)}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))
            )}
          </div>

          {/* Actions */}
          {selectedIds.length > 0 && (
            <div className="mt-3 pt-3 border-t flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={handleClear}
              >
                Effacer
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Appliquer
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
