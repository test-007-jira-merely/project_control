"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TaskFilters {
  search: string
  status: string
  priority: string
}

interface TaskFilterToolbarProps {
  filters: TaskFilters
  onFilterChange: (filters: TaskFilters) => void
  onClear: () => void
}

export function TaskFilterToolbar({ filters, onFilterChange, onClear }: TaskFilterToolbarProps) {
  const isFiltered = filters.search !== "" || filters.status !== "all" || filters.priority !== "all"

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук задач..."
          className="pl-8"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
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
        onValueChange={(value) => onFilterChange({ ...filters, priority: value })}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
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

      {isFiltered && (
        <Button variant="ghost" size="icon" onClick={onClear} className="shrink-0" title="Очистити фільтри">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
