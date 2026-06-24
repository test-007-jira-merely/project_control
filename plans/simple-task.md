# Plan: Centralize Task Status Labels

## Context
Currently, task status labels (like "todo", "in-progress") are defined repeatedly across components (e.g., `task-card.tsx`, `kanban-board.tsx`, `project-chart.tsx`, `stats.tsx`). This duplication risks inconsistency and makes updates difficult. 
Decisions:
- We will create `lib/constants.ts` to export a `TASK_STATUSES` mapping.
- To bridge the contradiction between singular card display ("Очікує") and dashboard chart/stat plural display ("Очікують"), the mapping will include `label`, `pluralLabel`, and `color` for each status.
- Components will be updated to import and use these constants.

## Stack already available (no new deps)
React, Tailwind CSS classes. We will create a new standard `lib/constants.ts` without introducing new dependencies.

## Implementation Order
1. Task 1: Create shared status map in `lib/constants.ts`
2. Task 2: Refactor Task Board and Task Card
3. Task 3: Refactor Task Dialogs
4. Task 4: Refactor Dashboard components

## Task 1: Create shared status map

**Files:**
- Create `lib/constants.ts`

**Why:** We need a single source of truth for the task status mapping. Using an object with `value`, `label`, `pluralLabel`, and `color` keys handles both the display names and styles across the entire application, stopping duplication.

- [ ] **Step 1: Create `lib/constants.ts` with the `TASK_STATUSES` map**
Define the `TASK_STATUSES` constant with properties for singular forms, plural forms, and colors. Export it and a union type for convenience.

```ts
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
```

## Task 2: Refactor Task Board and Task Card

**Files:**
- Modify `components/tasks/task-card.tsx`
- Modify `components/tasks/kanban-board.tsx`

**Why:** These components define inline status maps with labels and colors. Referencing the central object removes this duplication.

- [ ] **Step 1: Replace inline `statusMap` in `TaskCard`**
Remove the `statusMap` object from `components/tasks/task-card.tsx` and assign `status` directly using `TASK_STATUSES`.

```tsx
// ...
import { useToast } from "@/components/ui/use-toast"
import type { Task } from "@/lib/firebase/database"
import { TASK_STATUSES } from "@/lib/constants"

interface TaskCardProps {
// ...
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const priorityMap = {
    low: { label: "Низький", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
    medium: { label: "Середній", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    high: { label: "Високий", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    urgent: { label: "Терміновий", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  }

  const status = TASK_STATUSES[task.status] || TASK_STATUSES.todo
  const priority = priorityMap[task.priority] || priorityMap.medium
// ...
```
Imports: `import { TASK_STATUSES } from "@/lib/constants"`

- [ ] **Step 2: Update `kanban-board.tsx` column definitions**
Remove inline name literals and use `TASK_STATUSES` to derive column names dynamically. Update both `useState` initial definitions and the `useState` callback.

```tsx
// ...
import type { Task } from "@/lib/firebase/database"
import { TASK_STATUSES } from "@/lib/constants"

interface KanbanBoardProps {
// ...
export function KanbanBoard({ tasks, onTaskUpdated, onTaskDeleted, loading }: KanbanBoardProps) {
  const { toast } = useToast()
  const [columns, setColumns] = useState({
    todo: {
      name: TASK_STATUSES.todo.label,
      items: tasks.filter((task) => task.status === "todo"),
    },
    "in-progress": {
      name: TASK_STATUSES["in-progress"].label,
      items: tasks.filter((task) => task.status === "in-progress"),
    },
    review: {
      name: TASK_STATUSES.review.label,
      items: tasks.filter((task) => task.status === "review"),
    },
    completed: {
      name: TASK_STATUSES.completed.label,
      items: tasks.filter((task) => task.status === "completed"),
    },
  })

  // Оновлюємо колонки при зміні задач
  useState(() => {
    setColumns({
      todo: {
        name: TASK_STATUSES.todo.label,
        items: tasks.filter((task) => task.status === "todo"),
      },
      "in-progress": {
        name: TASK_STATUSES["in-progress"].label,
        items: tasks.filter((task) => task.status === "in-progress"),
      },
      review: {
        name: TASK_STATUSES.review.label,
        items: tasks.filter((task) => task.status === "review"),
      },
      completed: {
        name: TASK_STATUSES.completed.label,
        items: tasks.filter((task) => task.status === "completed"),
      },
    })
  })
// ...
```
Imports: `import { TASK_STATUSES } from "@/lib/constants"`

## Task 3: Refactor Task Dialogs

**Files:**
- Modify `components/tasks/task-create-dialog.tsx`
- Modify `components/tasks/task-edit-dialog.tsx`

**Why:** The dialogs hardcode `<SelectItem>` labels. Using the constant ensures consistency and automatically updates if the terminology changes.

- [ ] **Step 1: Update `task-create-dialog.tsx` options**
Update the Select options mapping to use `TASK_STATUSES`.

```tsx
// ...
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TASK_STATUSES } from "@/lib/constants"

export function TaskCreateDialog({ open, onOpenChange, onTaskCreated }: TaskCreateDialogProps) {
// ...
                      <SelectContent>
                        <SelectItem value="todo">{TASK_STATUSES.todo.label}</SelectItem>
                        <SelectItem value="in-progress">{TASK_STATUSES["in-progress"].label}</SelectItem>
                        <SelectItem value="review">{TASK_STATUSES.review.label}</SelectItem>
                        <SelectItem value="completed">{TASK_STATUSES.completed.label}</SelectItem>
                      </SelectContent>
// ...
```
Imports: `import { TASK_STATUSES } from "@/lib/constants"`

- [ ] **Step 2: Update `task-edit-dialog.tsx` options**
Update the Select options mapping to use `TASK_STATUSES` identically.

```tsx
// ...
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TASK_STATUSES } from "@/lib/constants"

export function TaskEditDialog({ open, onOpenChange, task, onTaskUpdated }: TaskEditDialogProps) {
// ...
                      <SelectContent>
                        <SelectItem value="todo">{TASK_STATUSES.todo.label}</SelectItem>
                        <SelectItem value="in-progress">{TASK_STATUSES["in-progress"].label}</SelectItem>
                        <SelectItem value="review">{TASK_STATUSES.review.label}</SelectItem>
                        <SelectItem value="completed">{TASK_STATUSES.completed.label}</SelectItem>
                      </SelectContent>
// ...
```
Imports: `import { TASK_STATUSES } from "@/lib/constants"`

## Task 4: Refactor Dashboard components

**Files:**
- Modify `components/dashboard/project-chart.tsx`
- Modify `components/dashboard/stats.tsx`
- Modify `components/dashboard/tasks-review.tsx`
- Modify `components/dashboard/user-stats.tsx`

**Why:** Dashboard displays use explicit strings for plural/contextual states ("Очікують", "Очікує"). Using `label` or `pluralLabel` properties decouples the exact text from the component.

- [ ] **Step 1: Update `project-chart.tsx` task mapping**
Replace hardcoded pie chart labels with `TASK_STATUSES`'s `pluralLabel`s.

```tsx
// ...
import { getProjectStats, getTaskStats } from "@/lib/firebase/stats"
import { TASK_STATUSES } from "@/lib/constants"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
// ...
  // Фільтруємо нульові значення для задач
  const taskData = [
    { name: TASK_STATUSES.todo.pluralLabel, value: taskStats.todo },
    { name: TASK_STATUSES["in-progress"].pluralLabel, value: taskStats.inProgress },
    { name: TASK_STATUSES.review.pluralLabel, value: taskStats.review },
    { name: TASK_STATUSES.completed.pluralLabel, value: taskStats.completed },
  ].filter((item) => item.value > 0)
// ...
```
Imports: `import { TASK_STATUSES } from "@/lib/constants"`

- [ ] **Step 2: Update `stats.tsx` text formatting**
Replace the hardcoded strings with lowercase projections of the `pluralLabel`s.

```tsx
// ...
import { getProjectStats, getTaskStats } from "@/lib/firebase/stats"
import { BarChart, CheckCircle, ListChecks, FolderKanban } from "lucide-react"
import { TASK_STATUSES } from "@/lib/constants"

export function DashboardStats() {
// ...
        <CardContent>
          <div className="text-2xl font-bold">{taskStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {taskStats.todo} {TASK_STATUSES.todo.pluralLabel.toLowerCase()}, {taskStats.inProgress} {TASK_STATUSES["in-progress"].pluralLabel.toLowerCase()}
          </p>
        </CardContent>
// ...
```
Imports: `import { TASK_STATUSES } from "@/lib/constants"`

- [ ] **Step 3: Update `tasks-review.tsx` badge rendering**
Replace the hardcoded classes and `На перевірці` text with the values from `TASK_STATUSES.review`.

```tsx
// ...
import { getTasksInReview, updateTaskStatus } from "@/lib/firebase/database"
import type { Task } from "@/lib/firebase/database"
import { TASK_STATUSES } from "@/lib/constants"

export function TasksInReview() {
// ...
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge
                        variant="outline"
                        className={TASK_STATUSES.review.color}
                      >
                        {TASK_STATUSES.review.label}
                      </Badge>
                    </div>
// ...
```
Imports: `import { TASK_STATUSES } from "@/lib/constants"`

- [ ] **Step 4: Update `user-stats.tsx` pie chart rendering**
Replace the hardcoded labels using `TASK_STATUSES` `label` strings.

```tsx
// ...
import { getUserStats } from "@/lib/firebase/stats"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { TASK_STATUSES } from "@/lib/constants"

interface UserStatsProps extends React.HTMLAttributes<HTMLDivElement> {}
// ...
  const COLORS = ["#00C49F", "#FFBB28"]

  const completionData = [
    { name: TASK_STATUSES.completed.label, value: stats.tasksCompleted },
    { name: TASK_STATUSES["in-progress"].label, value: stats.tasksAssigned - stats.tasksCompleted },
  ]
// ...
```
Imports: `import { TASK_STATUSES } from "@/lib/constants"`