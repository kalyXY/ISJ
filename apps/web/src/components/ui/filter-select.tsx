"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const ALL_VALUE = "all" as const;

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  includeAllOption?: boolean;
  allLabel?: string;
  className?: string;
}

export const isAll = (value?: string | null) => value === ALL_VALUE || value === undefined || value === null;

export const FilterSelect = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
  includeAllOption = true,
  allLabel = "Tous",
  className,
}: FilterSelectProps) => {
  return (
    <div className={className}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAllOption && (
            <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
          )}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}; 