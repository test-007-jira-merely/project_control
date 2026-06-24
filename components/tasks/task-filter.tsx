"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export interface FilterState {
  search: string;
  status: string;
  priority: string;
  assignee: string;
}

export const defaultFilterState: FilterState = {
  search: "",
  status: "all",
  priority: "all",
  assignee: "all",
};

interface TaskFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  members: any[];
}

export function TaskFilter({ filters, onFilterChange, members }: TaskFilterProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange(defaultFilterState);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.assignee !== "all";

  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center flex-wrap">
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Пошук за назвою або описом..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
      </div>

      <div className="w-full md:w-auto min-w-[150px]">
        <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі статуси</SelectItem>
            <SelectItem value="todo">Очікує</SelectItem>
            <SelectItem value="in-progress">В процесі</SelectItem>
            <SelectItem value="review">На перевірці</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-auto min-w-[150px]">
        <Select value={filters.priority} onValueChange={(v) => updateFilter("priority", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Пріоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі пріоритети</SelectItem>
            <SelectItem value="low">Низький</SelectItem>
            <SelectItem value="medium">Середній</SelectItem>
            <SelectItem value="high">Високий</SelectItem>
            <SelectItem value="urgent">Терміновий</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {members && members.length > 0 && (
        <div className="w-full md:w-auto min-w-[150px]">
          <Select value={filters.assignee} onValueChange={(v) => updateFilter("assignee", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Виконавець" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі виконавці</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.userName || m.userEmail || "Користувач"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full md:w-auto text-muted-foreground flex items-center gap-2">
          <X className="h-4 w-4" />
          Очистити
        </Button>
      )}
    </div>
  );
}