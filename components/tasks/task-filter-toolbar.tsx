"use client"

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
import type { ProjectMember } from "@/lib/firebase/database"

export interface TaskFilters {
  search: string
  status: string
  priority: string
  assignee: string
}

interface TaskFilterToolbarProps {
  filters: TaskFilters
  setFilters: (filters: TaskFilters) => void
  members: ProjectMember[]
}

export function TaskFilterToolbar({ filters, setFilters, members }: TaskFilterToolbarProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.assignee !== "all"

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      priority: "all",
      assignee: "all",
    })
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук задач за назвою або описом..."
          className="pl-8"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[150px]">
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
          value={filters.priority}
          onValueChange={(value) => setFilters({ ...filters, priority: value })}
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

        <Select
          value={filters.assignee}
          onValueChange={(value) => setFilters({ ...filters, assignee: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Виконавець" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі виконавці</SelectItem>
            <SelectItem value="unassigned">Не призначено</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.userId}>
                {member.userName || member.userEmail}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 px-2 lg:px-3">
            Очистити
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
