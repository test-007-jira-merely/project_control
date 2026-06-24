export const TASK_STATUSES = {
  todo: {
    value: "todo",
    label: "Очікує",
    pluralLabel: "Очікують",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  "in-progress": {
    value: "in-progress",
    label: "В процесі",
    pluralLabel: "В процесі",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  review: {
    value: "review",
    label: "На перевірці",
    pluralLabel: "На перевірці",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  completed: {
    value: "completed",
    label: "Завершено",
    pluralLabel: "Завершені",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
} as const;

export type TaskStatusKey = keyof typeof TASK_STATUSES;
