"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProjectTasks } from "@/lib/firebase/database"
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog"
import { TaskCard } from "@/components/tasks/task-card"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { useDebounce } from "@/hooks/use-debounce"
import { TaskFilterToolbar } from "@/components/tasks/task-filter-toolbar"
import type { Task } from "@/lib/firebase/database"

interface ProjectTasksProps {
  projectId: string
  canEdit: boolean
}

export function ProjectTasks({ projectId, canEdit }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Filter state
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [assignedToFilter, setAssignedToFilter] = useState<string | null>(null)

  const debouncedSearchText = useDebounce(searchText, 300)

  const fetchTasks = async () => {
    try {
      const projectTasks = await getProjectTasks(projectId)
      setTasks(projectTasks as Task[])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    fetchTasks()
  }, [projectId])

  const handleTaskCreated = (newTask: Task) => {
    fetchTasks();
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    fetchTasks();
  }

  const handleTaskDeleted = (taskId: string) => {
    fetchTasks();
  }

  // Filtering logic - single-pass for efficiency
  const filteredTasks = useMemo(() => {
    if (!debouncedSearchText && !statusFilter && !priorityFilter && !assignedToFilter) {
      return tasks
    }

    const searchLower = debouncedSearchText?.toLowerCase()

    return tasks.filter((task) => {
      // Search filter (title OR description, case-insensitive)
      if (searchLower) {
        const titleMatch = task.title.toLowerCase().includes(searchLower)
        const descMatch = task.description?.toLowerCase().includes(searchLower)
        if (!titleMatch && !descMatch) return false
      }

      // Status filter
      if (statusFilter && task.status !== statusFilter) return false

      // Priority filter
      if (priorityFilter && task.priority !== priorityFilter) return false

      // Assignee filter
      if (assignedToFilter) {
        if (assignedToFilter === "unassigned") {
          if (task.assignedTo !== null) return false
        } else {
          if (task.assignedTo !== assignedToFilter) return false
        }
      }

      return true
    })
  }, [tasks, debouncedSearchText, statusFilter, priorityFilter, assignedToFilter])

  const hasActiveFilters = Boolean(debouncedSearchText || statusFilter || priorityFilter || assignedToFilter)

  const handleClearFilters = () => {
    setSearchText("")
    setStatusFilter(null)
    setPriorityFilter(null)
    setAssignedToFilter(null)
  }

  // Empty state messages - extracted to avoid duplication across tabs
  const emptyStateTitle = hasActiveFilters ? "Немає задач, що відповідають фільтрам" : "Немає задач"
  const emptyStateDescription = hasActiveFilters
    ? "Спробуйте змінити критерії пошуку або скинути фільтри."
    : "У цьому проекті ще немає задач."

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Задачі проекту</h2>
        {canEdit && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Нова задача
          </Button>
        )}
      </div>

      <TaskFilterToolbar
        searchText={searchText}
        status={statusFilter}
        priority={priorityFilter}
        assignedTo={assignedToFilter}
        onSearchChange={setSearchText}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onAssignedToChange={setAssignedToFilter}
        onClearFilters={handleClearFilters}
        projectId={projectId}
      />

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Список</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 rounded-md border border-dashed p-4">
                  <div className="h-full animate-pulse rounded-md bg-muted"></div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <KanbanBoard
            tasks={filteredTasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            loading={loading}
          />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{emptyStateTitle}</CardTitle>
                <CardDescription>{emptyStateDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasActiveFilters && canEdit && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Створити першу задачу
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 rounded-md border border-dashed p-4">
                  <div className="h-full animate-pulse rounded-md bg-muted"></div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{emptyStateTitle}</CardTitle>
                <CardDescription>{emptyStateDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasActiveFilters && canEdit && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Створити першу задачу
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {canEdit && (
        <TaskCreateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          projectId={projectId}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}
