/**
 * Shared status and priority label/color mappings.
 * Single source of truth for all task and project status display across the UI.
 */

export const TASK_STATUS_MAP = {
  todo: {
    label: "Очікує",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  "in-progress": {
    label: "В процесі",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  review: {
    label: "На перевірці",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  completed: {
    label: "Завершено",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
} as const

export const TASK_PRIORITY_MAP = {
  low: {
    label: "Низький",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  medium: {
    label: "Середній",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  high: {
    label: "Високий",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
  urgent: {
    label: "Терміновий",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
} as const

export const PROJECT_STATUS_MAP = {
  planning: {
    label: "Планування",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  active: {
    label: "Активний",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  completed: {
    label: "Завершений",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  archived: {
    label: "Архівований",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
} as const
