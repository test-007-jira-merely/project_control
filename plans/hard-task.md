# Hard Task: Add Task Filtering and Quick Search

## Type
New Feature

## Goal
Add a reusable task filtering experience that lets users search and narrow tasks by status, priority, and assignee from project task screens.

## Why this matters
The repo already has task management, review, and kanban UI. A filter layer would make larger task lists much easier to work with and would improve day-to-day usability.

## Scope
- Add a search input for task title and description.
- Add filters for status and priority.
- Optionally include assignee filtering when user data is available.
- Keep filters working in both board and list-style task views where applicable.
- Preserve existing task creation, editing, and deletion flows.

## Suggested Steps
1. Define a shared filter state model for task queries.
2. Build a small filter toolbar component that can be reused across task views.
3. Apply filtering before rendering task lists or kanban columns.
4. If needed, debounce search input to keep the UI responsive.
5. Make sure empty states still make sense when filters hide all tasks.
6. Add a clear-filters action so users can quickly reset the view.

## Acceptance Criteria
- Users can search tasks by text.
- Users can filter by status and priority.
- The UI clearly shows when filters are active.
- Clearing filters restores the full task list.
- The implementation stays consistent with the existing app structure and Firebase-backed data model.

