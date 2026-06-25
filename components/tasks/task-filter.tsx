"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TaskFiltersState {
  search: string
  status: string
  priority: string
}

export const initialFilters: TaskFiltersState = {
  search: "",
  status: "all",
  priority: "all",
}

interface TaskFilterProps {
  filters: TaskFiltersState
  onFiltersChange: (filters: TaskFiltersState) => void
  onClear: () => void
}

export function TaskFilter({ filters, onFiltersChange, onClear }: TaskFilterProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== localSearch) {
        onFiltersChange({ ...filters, search: localSearch })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, filters, onFiltersChange])

  useEffect(() => {
    setLocalSearch(filters.search)
  }, [filters.search])

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.priority !== "all"

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за назвою або описом..."
          className="pl-8"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(val) => onFiltersChange({ ...filters, status: val })}
        >
          <SelectTrigger className="w-[140px]">
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
          onValueChange={(val) => onFiltersChange({ ...filters, priority: val })}
        >
          <SelectTrigger className="w-[140px]">
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
    </div>
  )
}
