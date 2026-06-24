import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

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
  const hasFilters = filters.search || filters.status !== "all" || filters.priority !== "all"

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
      <Input
        placeholder="Пошук задач..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="max-w-sm"
      />
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Всі статуси" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі статуси</SelectItem>
          <SelectItem value="todo">Очікує</SelectItem>
          <SelectItem value="in-progress">В процесі</SelectItem>
          <SelectItem value="review">На перевірці</SelectItem>
          <SelectItem value="completed">Завершено</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(value) => onFilterChange({ ...filters, priority: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Всі пріоритети" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі пріоритети</SelectItem>
          <SelectItem value="low">Низький</SelectItem>
          <SelectItem value="medium">Середній</SelectItem>
          <SelectItem value="high">Високий</SelectItem>
          <SelectItem value="urgent">Терміновий</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" onClick={onClear} className="px-2 lg:px-3">
          <X className="mr-2 h-4 w-4" />
          Очистити
        </Button>
      )}
    </div>
  )
}
