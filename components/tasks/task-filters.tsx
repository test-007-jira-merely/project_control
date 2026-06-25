import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"

export interface TaskFilterState {
  searchQuery: string
  statusFilter: string
  priorityFilter: string
}

export const defaultTaskFilterState: TaskFilterState = {
  searchQuery: "",
  statusFilter: "all",
  priorityFilter: "all",
}

interface TaskFiltersProps {
  filters: TaskFilterState
  setFilters: (filters: TaskFilterState) => void
  onClear: () => void
}

export function TaskFilters({ filters, setFilters, onClear }: TaskFiltersProps) {
  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.statusFilter !== "all" ||
    filters.priorityFilter !== "all"

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук задач..."
          className="pl-8"
          value={filters.searchQuery}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
        />
      </div>
      <div className="flex flex-1 items-center gap-2">
        <Select
          value={filters.statusFilter}
          onValueChange={(val) => setFilters({ ...filters, statusFilter: val })}
        >
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

        <Select
          value={filters.priorityFilter}
          onValueChange={(val) => setFilters({ ...filters, priorityFilter: val })}
        >
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

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={onClear} title="Очистити фільтри">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
