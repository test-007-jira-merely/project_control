# Medium Task: Fix Task Assignment Fallback in Edit Dialog

## Type
Bug Fix

## Goal
Make the task edit flow handle unassigned tasks more reliably so the dialog does not depend on a fragile placeholder value.

## Why this matters
The edit dialog currently uses a special string fallback for unassigned tasks. That approach is easy to break and can leak implementation details into form state.

## Scope
- Replace placeholder-based assignment handling with a cleaner unassigned state.
- Ensure the task edit form loads, displays, and submits assigned/unassigned values correctly.
- Keep existing Firestore update behavior intact.

## Suggested Steps
1. Inspect the task edit dialog form initialization and submit logic.
2. Replace the `"unassigned"` placeholder with an explicit empty or null-based representation.
3. Update the select input and payload mapping so unassigned tasks remain valid.
4. Test editing a task with an assignee and editing a task without one.

## Acceptance Criteria
- Unassigned tasks open in the edit dialog without relying on a fake assignee value.
- Saving an unchanged unassigned task does not introduce bad data.
- Assigned tasks still save correctly.

