"use client"

import { useState, useEffect } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProjectMembers } from "@/lib/firebase/database"

export interface TaskFilters {
  search: string
  status: string
  priority: string
  assignedTo: string
}

interface TaskFilterToolbarProps {
  projectId: string
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  activeFilterCount: number
}

export function TaskFilterToolbar({ projectId, filters, onFiltersChange, activeFilterCount }: TaskFilterToolbarProps) {
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const projectMembers = await getProjectMembers(projectId)
        setMembers(projectMembers)
      } catch (error) {
        console.error("Error fetching members:", error)
      }
    }
    fetchMembers()
  }, [projectId])

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      priority: "all",
      assignedTo: "all",
    })
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Фільтри</h3>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {activeFilterCount}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук задач..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
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
          value={filters.priority}
          onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
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
          value={filters.assignedTo}
          onValueChange={(value) => onFiltersChange({ ...filters, assignedTo: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Всі виконавці" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі виконавці</SelectItem>
            <SelectItem value="unassigned">Не призначено</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.userName || member.userEmail}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters button */}
      {activeFilterCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Очистити фільтри
          </Button>
        </div>
      )}
    </div>
  )
}
