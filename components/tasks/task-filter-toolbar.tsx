"use client"

import { useEffect, useState } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getProjectMembers } from "@/lib/firebase/database"
import type { ProjectMember } from "@/lib/firebase/database"

interface TaskFilterToolbarProps {
  searchText: string
  status: string | null
  priority: string | null
  assignedTo: string | null
  onSearchChange: (value: string) => void
  onStatusChange: (value: string | null) => void
  onPriorityChange: (value: string | null) => void
  onAssignedToChange: (value: string | null) => void
  onClearFilters: () => void
  projectId: string
}

export function TaskFilterToolbar({
  searchText,
  status,
  priority,
  assignedTo,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onAssignedToChange,
  onClearFilters,
  projectId,
}: TaskFilterToolbarProps) {
  const [members, setMembers] = useState<ProjectMember[]>([])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const projectMembers = await getProjectMembers(projectId)
        setMembers(projectMembers)
      } catch (error) {
        console.error("Error fetching members:", error)
        // Graceful degradation: empty members array means assignee filter still works with "Unassigned"
        setMembers([])
      }
    }

    fetchMembers()
  }, [projectId])

  const activeFilterCount =
    (searchText !== "" ? 1 : 0) +
    (status !== null ? 1 : 0) +
    (priority !== null ? 1 : 0) +
    (assignedTo !== null ? 1 : 0)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
        {/* Search input */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук за назвою або описом..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <Select
          value={status || "all"}
          onValueChange={(value) => onStatusChange(value === "all" ? null : value)}
        >
          <SelectTrigger>
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

        {/* Priority filter */}
        <Select
          value={priority || "all"}
          onValueChange={(value) => onPriorityChange(value === "all" ? null : value)}
        >
          <SelectTrigger>
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

        {/* Assignee filter */}
        <Select
          value={assignedTo || "all"}
          onValueChange={(value) => onAssignedToChange(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Всі виконавці" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі виконавці</SelectItem>
            <SelectItem value="unassigned">Без виконавця</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.userName || member.userEmail}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters button - only show when filters are active */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-8"
          >
            <X className="mr-2 h-3 w-3" />
            Скинути фільтри
          </Button>
          <Badge variant="secondary" className="h-6">
            <Filter className="mr-1 h-3 w-3" />
            {activeFilterCount}
          </Badge>
        </div>
      )}
    </div>
  )
}
