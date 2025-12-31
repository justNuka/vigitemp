'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  id: number | string;
  label: string;
  disabled?: boolean;
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
  const dropdownId = useId();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id: number | string, disabled?: boolean) => {
    if (disabled) return;

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
    <div
      ref={containerRef}
      className="relative w-full"
      onKeyDownCapture={(e) => {
        if (e.key === 'Escape') setIsOpen(false);
      }}
    >
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          <span className="text-sm font-medium">{label}</span>
          {selectedIds.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {selectedIds.length}
            </Badge>
          )}
          {selectedIds.length === 0 && placeholder ? (
            <span className="ml-2 text-sm text-muted-foreground">{placeholder}</span>
          ) : null}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div
          id={dropdownId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute top-full left-0 right-0 z-50 mt-2 border border-input bg-popover rounded-md shadow-md p-2"
        >
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

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Aucune option</p>
            ) : (
              options.map((option) => (
                <label
                  key={option.id}
                  role="option"
                  aria-selected={selectedIds.includes(option.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                      : 'hover:bg-accent'
                  }`}
                  onClick={(e) => {
                    if (option.disabled) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedIds.includes(option.id)}
                    onCheckedChange={() => handleToggle(option.id, option.disabled)}
                    disabled={option.disabled}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-3 pt-3 border-t flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1" onClick={handleClear}>
                Effacer
              </Button>
              <Button size="sm" className="flex-1" onClick={() => setIsOpen(false)}>
                Appliquer
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

