import type { Task } from "@/lib/firebase/database"

export type TaskStatus = Task["status"]

export const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "review", "completed"]

export const TASK_STATUS_META: Record<
  TaskStatus,
  {
    label: string
    chartLabel: string
    color: string
  }
> = {
  todo: {
    label: "Очікує",
    chartLabel: "Очікують",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  "in-progress": {
    label: "В процесі",
    chartLabel: "В процесі",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  review: {
    label: "На перевірці",
    chartLabel: "На перевірці",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  completed: {
    label: "Завершено",
    chartLabel: "Завершені",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
}

export const TASK_STATUS_OPTIONS = TASK_STATUS_ORDER.map((status) => ({
  value: status,
  label: TASK_STATUS_META[status].label,
}))

export function getTaskStatusMeta(status: TaskStatus | string) {
  return TASK_STATUS_META[status as TaskStatus] ?? TASK_STATUS_META.todo
}
