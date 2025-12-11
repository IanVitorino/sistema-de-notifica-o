'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TopSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export function TopSelector({ value, onChange, options = [5, 10, 15, 20] }: TopSelectorProps) {
  return (
    <Select value={value.toString()} onValueChange={(val) => onChange(Number(val))}>
      <SelectTrigger className="w-[120px] h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option.toString()}>
            Top {option}
          </SelectItem>
        ))}
        <SelectItem value="999">Todos</SelectItem>
      </SelectContent>
    </Select>
  );
}
