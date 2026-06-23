import type { Task } from "@/lib/firebase/database"

export type TaskStatus = Task["status"]

export const TASK_STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "Очікує", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  "in-progress": { label: "В процесі", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  review: { label: "На перевірці", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  completed: { label: "Завершено", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
}

export const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "review", "completed"]

export const TASK_STATUS_OPTIONS = TASK_STATUS_ORDER.map((value) => ({
  value,
  label: TASK_STATUS_META[value].label,
}))

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: TASK_STATUS_META.todo.label,
  "in-progress": TASK_STATUS_META["in-progress"].label,
  review: TASK_STATUS_META.review.label,
  completed: TASK_STATUS_META.completed.label,
}
