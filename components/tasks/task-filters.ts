import type { Task } from "@/lib/firebase/database"

export type TaskStatusFilter = Task["status"] | "all"
export type TaskPriorityFilter = Task["priority"] | "all"

export interface TaskFilters {
  search: string
  status: TaskStatusFilter
  priority: TaskPriorityFilter
}

export const defaultTaskFilters: TaskFilters = {
  search: "",
  status: "all",
  priority: "all",
}

export const taskStatusOptions: Array<{ value: TaskStatusFilter; label: string }> = [
  { value: "all", label: "Усі статуси" },
  { value: "todo", label: "Очікує" },
  { value: "in-progress", label: "В процесі" },
  { value: "review", label: "На перевірці" },
  { value: "completed", label: "Завершено" },
]

export const statusMap = {
  todo: { label: "Очікує", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  "in-progress": { label: "В процесі", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  review: { label: "На перевірці", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  completed: { label: "Завершено", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
}

export const taskPriorityOptions: Array<{ value: TaskPriorityFilter; label: string }> = [
  { value: "all", label: "Усі пріоритети" },
  { value: "low", label: "Низький" },
  { value: "medium", label: "Середній" },
  { value: "high", label: "Високий" },
  { value: "urgent", label: "Терміновий" },
]

export const priorityMap = {
  low: { label: "Низький", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  medium: { label: "Середній", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  high: { label: "Високий", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  urgent: { label: "Терміновий", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
}

export function hasActiveTaskFilters(filters: TaskFilters) {
  return filters.search.trim().length > 0 || filters.status !== "all" || filters.priority !== "all"
}

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const query = filters.search.trim().toLocaleLowerCase()

  return tasks.filter((task) => {
    const matchesSearch =
      query.length === 0 ||
      task.title.toLocaleLowerCase().includes(query) ||
      task.description.toLocaleLowerCase().includes(query)
    const matchesStatus = filters.status === "all" || task.status === filters.status
    const matchesPriority = filters.priority === "all" || task.priority === filters.priority

    return matchesSearch && matchesStatus && matchesPriority
  })
}
