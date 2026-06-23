# Simple Task: Centralize Task Status Labels

## Type
Refactoring

## Goal
Remove duplicated task status label definitions and make the status display consistent across task-related components.

## Why this matters
Several components in the repo define the same task status labels in slightly different ways. That makes future UI changes error-prone and increases the chance of inconsistent wording.

## Scope
- Create a shared status-label mapping in a single reusable location.
- Update task UI components to use the shared mapping.
- Keep the visual output unchanged.

## Suggested Steps
1. Find all duplicated task status label maps in `components/tasks` and related dashboard views.
2. Extract the mapping into a shared helper or constants file under `lib/` or `components/`.
3. Update each consumer to import the shared mapping.
4. Verify the labels still render correctly in the board, card, and review views.

## Acceptance Criteria
- Task status labels come from one shared source.
- No behavior or styling changes are introduced.
- The codebase has less duplication in task status rendering.

