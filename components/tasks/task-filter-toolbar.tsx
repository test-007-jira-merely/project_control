"use client"

import { useEffect, useRef, useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  defaultTaskFilters,
  hasActiveTaskFilters,
  taskPriorityOptions,
  taskStatusOptions,
  type TaskFilters,
  type TaskPriorityFilter,
  type TaskStatusFilter,
} from "@/components/tasks/task-filters"

interface TaskFilterToolbarProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  totalCount: number
  resultCount: number
}

export function TaskFilterToolbar({ filters, onFiltersChange, totalCount, resultCount }: TaskFilterToolbarProps) {
  const [searchValue, setSearchValue] = useState(filters.search)
  const filtersActive = hasActiveTaskFilters(filters)
  const filtersRef = useRef(filters)

  // Keep ref up to date for the debounce effect without triggering it
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Sync internal state when external search changes (e.g. on reset)
  useEffect(() => {
    setSearchValue(filters.search)
  }, [filters.search])

  // Debounced search update
  useEffect(() => {
    if (searchValue === filtersRef.current.search) return

    const timeout = window.setTimeout(() => {
      onFiltersChange({ ...filtersRef.current, search: searchValue })
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [searchValue, onFiltersChange])

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Пошук за назвою або описом..."
            className="pl-9"
            aria-label="Пошук задач"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as TaskStatusFilter })}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            {taskStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => onFiltersChange({ ...filters, priority: value as TaskPriorityFilter })}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Пріоритет" />
          </SelectTrigger>
          <SelectContent>
            {taskPriorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filtersActive && (
          <Button type="button" variant="outline" onClick={() => onFiltersChange(defaultTaskFilters)}>
            <X className="mr-2 h-4 w-4" />
            Очистити
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant={filtersActive ? "default" : "secondary"}>
          <SlidersHorizontal className="mr-1 h-3 w-3" />
          {filtersActive ? "Фільтри активні" : "Фільтри не застосовано"}
        </Badge>
        {filtersActive && <span>Показано {resultCount} з {totalCount} задач</span>}
      </div>
    </div>
  )
}
