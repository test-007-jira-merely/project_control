import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface TaskFilterState {
  search: string
  status: string
  priority: string
  assigneeId: string
}

interface TaskFiltersProps {
  filters: TaskFilterState
  onChange: (filters: TaskFilterState) => void
  onClear: () => void
}

export function TaskFilters({ filters, onChange, onClear }: TaskFiltersProps) {
  const hasActiveFilters = filters.search || filters.status !== "all" || filters.priority !== "all" || filters.assigneeId !== "all"

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук задач..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(val) => onChange({ ...filters, status: val })}
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
          onValueChange={(val) => onChange({ ...filters, priority: val })}
        >
          <SelectTrigger className="w-[150px]">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            title="Очистити фільтри"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Очистити фільтри</span>
          </Button>
        )}
      </div>
    </div>
  )
}
