# Implementation Plan: T-01 Centralize Task Status Labels

## Goal

Centralize task status display metadata so task-related UI components render the same existing labels and badge styles from one shared source. Preserve all current user-facing text, colors, behavior, and layout.

## Brainstorm Summary

The task status keys are already defined by `Task["status"]` in `lib/firebase/database.ts`:

```ts
"todo" | "in-progress" | "review" | "completed"
```

The duplicated display values appear in these primary task consumers:

```txt
components/tasks/task-card.tsx
components/tasks/kanban-board.tsx
components/tasks/task-create-dialog.tsx
components/tasks/task-edit-dialog.tsx
components/dashboard/tasks-review.tsx
components/dashboard/project-chart.tsx
```

Some nearby dashboard summary strings also reference status-like wording:

```txt
components/dashboard/stats.tsx
components/dashboard/user-stats.tsx
```

These should generally remain unchanged unless they are direct status labels. They are sentence/chart summary wording, not one-to-one task status labels, so changing them risks awkward grammar and is outside the core refactor.

The shared source should include both singular UI labels and the existing chart labels because the dashboard chart currently uses plural labels for some statuses:

```txt
todo: label "Очікує", chartLabel "Очікують"
completed: label "Завершено", chartLabel "Завершені"
```

## Shared File

Create `lib/task-statuses.ts`.

Recommended shape:

```ts
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
```

Why this shape:

- `TaskStatus` keeps the constant aligned with the existing domain type.
- `TASK_STATUS_ORDER` gives forms and kanban columns a stable render order.
- `TASK_STATUS_META` is the single source for label and badge color metadata.
- `chartLabel` preserves current chart output without forcing plural wording into cards/forms.
- `getTaskStatusMeta` preserves existing fallback behavior from `task-card.tsx`, where unknown statuses fall back to `todo`.

## File Changes

### `components/tasks/task-card.tsx`

Replace the local `statusMap` with the shared helper.

Add import:

```ts
import { getTaskStatusMeta } from "@/lib/task-statuses"
```

Remove:

```ts
const statusMap = {
  todo: { label: "Очікує", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  "in-progress": { label: "В процесі", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  review: { label: "На перевірці", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  completed: { label: "Завершено", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
}
```

Replace:

```ts
const status = statusMap[task.status] || statusMap.todo
```

With:

```ts
const status = getTaskStatusMeta(task.status)
```

Leave `priorityMap` unchanged because task priority centralization is not part of this task.

Expected output remains:

```tsx
<Badge className={status.color}>{status.label}</Badge>
```

### `components/tasks/kanban-board.tsx`

Use the shared status order and labels for column names.

Add import:

```ts
import { TASK_STATUS_META, TASK_STATUS_ORDER } from "@/lib/task-statuses"
```

Add a small local column builder above the component:

```ts
function buildColumns(tasks: Task[]) {
  return Object.fromEntries(
    TASK_STATUS_ORDER.map((status) => [
      status,
      {
        name: TASK_STATUS_META[status].label,
        items: tasks.filter((task) => task.status === status),
      },
    ]),
  ) as Record<Task["status"], { name: string; items: Task[] }>
}
```

Replace both repeated column object literals with:

```ts
const [columns, setColumns] = useState(buildColumns(tasks))
```

And inside the existing task-change synchronization block:

```ts
setColumns(buildColumns(tasks))
```

Important: keep the hook behavior focused on this refactor. Do not include unrelated kanban state synchronization fixes unless separately requested. If the implementation naturally touches the current `useState(() => setColumns(...))` block, keep behavior equivalent or make the smallest safe correction only if TypeScript/React requires it.

Expected visible column names remain:

```txt
Очікує
В процесі
На перевірці
Завершено
```

### `components/tasks/task-create-dialog.tsx`

Use shared options for the status select.

Add import:

```ts
import { TASK_STATUS_OPTIONS } from "@/lib/task-statuses"
```

Replace the four hardcoded status `SelectItem`s:

```tsx
<SelectItem value="todo">Очікує</SelectItem>
<SelectItem value="in-progress">В процесі</SelectItem>
<SelectItem value="review">На перевірці</SelectItem>
<SelectItem value="completed">Завершено</SelectItem>
```

With:

```tsx
{TASK_STATUS_OPTIONS.map((status) => (
  <SelectItem key={status.value} value={status.value}>
    {status.label}
  </SelectItem>
))}
```

Leave the Zod enum unchanged unless a broader type refactor is desired later. The task is about display label centralization, not validation/data model changes.

### `components/tasks/task-edit-dialog.tsx`

Apply the same select refactor as `task-create-dialog.tsx`.

Add import:

```ts
import { TASK_STATUS_OPTIONS } from "@/lib/task-statuses"
```

Replace the hardcoded `SelectItem`s with:

```tsx
{TASK_STATUS_OPTIONS.map((status) => (
  <SelectItem key={status.value} value={status.value}>
    {status.label}
  </SelectItem>
))}
```

Do not change the `assignedTo` behavior or priority options.

### `components/dashboard/tasks-review.tsx`

Use shared metadata for the review badge label and color.

Add import:

```ts
import { getTaskStatusMeta } from "@/lib/task-statuses"
```

Inside the component, define:

```ts
const reviewStatus = getTaskStatusMeta("review")
```

Replace the hardcoded badge:

```tsx
<Badge
  variant="outline"
  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
>
  На перевірці
</Badge>
```

With:

```tsx
<Badge variant="outline" className={reviewStatus.color}>
  {reviewStatus.label}
</Badge>
```

This preserves both the `variant="outline"` prop and the current yellow classes.

### `components/dashboard/project-chart.tsx`

Use shared chart labels for task status distribution.

Add import:

```ts
import { TASK_STATUS_META } from "@/lib/task-statuses"
```

Replace:

```ts
const taskData = [
  { name: "Очікують", value: taskStats.todo },
  { name: "В процесі", value: taskStats.inProgress },
  { name: "На перевірці", value: taskStats.review },
  { name: "Завершені", value: taskStats.completed },
].filter((item) => item.value > 0)
```

With:

```ts
const taskData = [
  { name: TASK_STATUS_META.todo.chartLabel, value: taskStats.todo },
  { name: TASK_STATUS_META["in-progress"].chartLabel, value: taskStats.inProgress },
  { name: TASK_STATUS_META.review.chartLabel, value: taskStats.review },
  { name: TASK_STATUS_META.completed.chartLabel, value: taskStats.completed },
].filter((item) => item.value > 0)
```

Expected chart labels remain:

```txt
Очікують
В процесі
На перевірці
Завершені
```

### `components/dashboard/stats.tsx`

No change recommended.

Reason: the string `{taskStats.todo} очікують, {taskStats.inProgress} в процесі` is sentence/summary wording with lowercase grammar, not a direct task status label display. Replacing it with the shared title-case/singular label would change visual text and grammar.

### `components/dashboard/user-stats.tsx`

No change recommended.

Reason: `completionData` splits assigned tasks into completed vs not completed. The "В процесі" label here is an aggregate bucket, not necessarily the concrete `in-progress` task status. Centralizing it as a task status label could imply incorrect semantics.

## Verification

Run static/build checks after implementation:

```bash
npm run build
```

If the existing lint script works in this project, also run:

```bash
npm run lint
```

Manual/visual smoke targets:

- Project task list cards still show the same status badge text and colors.
- Kanban columns still render in the same order with the same names.
- Create task and edit task dialogs still show the same four status options in the same order.
- Dashboard review card still shows the yellow "На перевірці" badge.
- Dashboard task status chart still shows plural labels where it did before.

## Acceptance Checklist

- `lib/task-statuses.ts` is the single source for direct task status labels.
- Task card, kanban board, task create dialog, task edit dialog, review view, and task chart import the shared source.
- No project status maps are changed.
- No priority maps are changed.
- No Firebase data model or task status values are changed.
- Current Ukrainian wording and Tailwind color classes are preserved.
