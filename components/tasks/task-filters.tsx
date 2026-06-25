"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export interface TaskFilterState {
  search: string
  status: string
  priority: string
}

interface TaskFiltersProps {
  filters: TaskFilterState
  onFilterChange: (filters: TaskFilterState) => void
  onClear: () => void
}

export function TaskFilters({ filters, onFilterChange, onClear }: TaskFiltersProps) {
  const isFiltering =
    filters.search !== "" || filters.status !== "all" || filters.priority !== "all"

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center mb-6 bg-muted/50 p-4 rounded-lg">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук задач..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-8 bg-background w-full"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(val) => onFilterChange({ ...filters, status: val })}
      >
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
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
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
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

      {isFiltering && (
        <Button variant="ghost" onClick={onClear} className="w-full sm:w-auto h-10 px-4">
          <X className="mr-2 h-4 w-4" />
          Очистити
        </Button>
      )}
    </div>
  )
}