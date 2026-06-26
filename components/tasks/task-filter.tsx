"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"

export interface TaskFilterState {
  search: string
  status: string
  priority: string
}

interface TaskFilterProps {
  filters: TaskFilterState
  onFilterChange: (filters: TaskFilterState) => void
  onClear: () => void
}

export function TaskFilter({ filters, onFilterChange, onClear }: TaskFilterProps) {
  const hasActiveFilters = filters.search || filters.status !== "all" || filters.priority !== "all"

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-muted/50 p-4 rounded-lg border border-border">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за назвою або описом..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-8"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(val) => onFilterChange({ ...filters, status: val })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі статуси</SelectItem>
          <SelectItem value="todo">До виконання</SelectItem>
          <SelectItem value="in-progress">В процесі</SelectItem>
          <SelectItem value="review">На перевірці</SelectItem>
          <SelectItem value="completed">Завершено</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(val) => onFilterChange({ ...filters, priority: val })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
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

      {hasActiveFilters && (
        <Button variant="ghost" size="icon" onClick={onClear} title="Очистити фільтри">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
