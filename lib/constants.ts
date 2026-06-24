export const TASK_STATUS = {
  todo: {
    value: "todo",
    label: "Очікує",
    labelPlural: "Очікують",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  "in-progress": {
    value: "in-progress",
    label: "В процесі",
    labelPlural: "В процесі",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  review: {
    value: "review",
    label: "На перевірці",
    labelPlural: "На перевірці",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  completed: {
    value: "completed",
    label: "Завершено",
    labelPlural: "Завершені",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
} as const;

export const TASK_PRIORITY = {
  low: {
    value: "low",
    label: "Низький",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  medium: {
    value: "medium",
    label: "Середній",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  high: {
    value: "high",
    label: "Високий",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
  urgent: {
    value: "urgent",
    label: "Терміновий",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
} as const;

export const TASK_STATUS_LIST = Object.values(TASK_STATUS);
export const TASK_PRIORITY_LIST = Object.values(TASK_PRIORITY);
