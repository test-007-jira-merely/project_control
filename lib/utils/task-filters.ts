import type { Task } from "@/lib/firebase/database"
import type { TaskFilters } from "@/components/tasks/task-filter-toolbar"

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    // Search filter: case-insensitive partial match on title and description
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      if (task.status !== filters.status) return false
    }

    // Priority filter
    if (filters.priority && filters.priority !== "all") {
      if (task.priority !== filters.priority) return false
    }

    // Assignee filter
    if (filters.assignedTo && filters.assignedTo !== "all") {
      if (filters.assignedTo === "unassigned") {
        if (task.assignedTo !== null) return false
      } else {
        if (task.assignedTo !== filters.assignedTo) return false
      }
    }

    return true
  })
}

export function getActiveFilterCount(filters: TaskFilters): number {
  let count = 0
  if (filters.search) count++
  if (filters.status && filters.status !== "all") count++
  if (filters.priority && filters.priority !== "all") count++
  if (filters.assignedTo && filters.assignedTo !== "all") count++
  return count
}
