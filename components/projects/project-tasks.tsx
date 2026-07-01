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
import { TaskFilterToolbar } from "@/components/tasks/task-filter-toolbar"
import {
  defaultTaskFilters,
  filterTasks,
  hasActiveTaskFilters,
  type TaskFilters,
} from "@/components/tasks/task-filters"
import type { Task } from "@/lib/firebase/database"

interface ProjectTasksProps {
  projectId: string
  canEdit: boolean
}

export function ProjectTasks({ projectId, canEdit }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>(defaultTaskFilters)

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

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters])
  const filtersActive = hasActiveTaskFilters(filters)
  const hasTasks = tasks.length > 0

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const LoadingState = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-40 rounded-md border border-dashed p-4">
          <div className="h-full animate-pulse rounded-md bg-muted"></div>
        </div>
      ))}
    </div>
  )

  const ProjectEmptyState = () => (
    <Card>
      <CardHeader>
        <CardTitle>Немає задач</CardTitle>
        <CardDescription>У цьому проекті ще немає задач.</CardDescription>
      </CardHeader>
      <CardContent>
        {canEdit && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Створити першу задачу
          </Button>
        )}
      </CardContent>
    </Card>
  )

  const renderContent = (view: "kanban" | "list") => {
    if (loading) return <LoadingState />
    if (!hasTasks) return <ProjectEmptyState />
    if (filteredTasks.length === 0 && filtersActive) return renderFilteredEmptyState()

    if (view === "kanban") {
      return (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          loading={loading}
        />
      )
    }

    return (
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
    )
  }

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

      {!loading && (
        <TaskFilterToolbar
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={tasks.length}
          resultCount={filteredTasks.length}
        />
      )}

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Список</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="space-y-4">
          {renderContent("kanban")}
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          {renderContent("list")}
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
