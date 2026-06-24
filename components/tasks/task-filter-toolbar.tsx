"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Search } from "lucide-react"

export interface TaskFilters {
  search: string
  status: string
  priority: string
  assignee: string
}

interface TaskFilterToolbarProps {
  filters: TaskFilters
  onFilterChange: (filters: TaskFilters) => void
  members: any[]
}

export function TaskFilterToolbar({ filters, onFilterChange, members }: TaskFilterToolbarProps) {
  const handleReset = () => {
    onFilterChange({ search: "", status: "all", priority: "all", assignee: "all" })
  }

  const hasActiveFilters = filters.search !== "" || filters.status !== "all" || filters.priority !== "all" || filters.assignee !== "all"

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук задач..."
          className="pl-8"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </div>
      <Select value={filters.status} onValueChange={(val) => onFilterChange({ ...filters, status: val })}>
        <SelectTrigger className="w-full sm:w-[150px]">
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
      <Select value={filters.priority} onValueChange={(val) => onFilterChange({ ...filters, priority: val })}>
        <SelectTrigger className="w-full sm:w-[150px]">
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
      <Select value={filters.assignee} onValueChange={(val) => onFilterChange({ ...filters, assignee: val })}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Виконавець" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі виконавці</SelectItem>
          <SelectItem value="unassigned">Без виконавця</SelectItem>
          {members.map(member => (
            <SelectItem key={member.userId} value={member.userId}>{member.userName}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {hasActiveFilters && (
        <Button variant="ghost" size="icon" onClick={handleReset} title="Скинути фільтри">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
