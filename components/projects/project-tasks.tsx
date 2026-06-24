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
import { TaskFilterToolbar, type TaskFilters } from "@/components/tasks/task-filter-toolbar"
import { useDebounce } from "@/hooks/use-debounce"
import { filterTasks, getActiveFilterCount } from "@/lib/utils/task-filters"
import type { Task } from "@/lib/firebase/database"

const DEFAULT_FILTERS: TaskFilters = {
  search: "",
  status: "all",
  priority: "all",
  assignedTo: "all",
}

interface ProjectTasksProps {
  projectId: string
  canEdit: boolean
}

export function ProjectTasks({ projectId, canEdit }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)

  // Debounce search input to avoid filtering on every keystroke
  const debouncedSearch = useDebounce(filters.search, 300)

  // Apply filters with debounced search (memoized to avoid redundant computation)
  const filtersWithDebounce = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  )
  const filteredTasks = useMemo(
    () => filterTasks(tasks, filtersWithDebounce),
    [tasks, filtersWithDebounce]
  )
  const activeFilterCount = useMemo(
    () => getActiveFilterCount(filtersWithDebounce),
    [filtersWithDebounce]
  )

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

      {/* Filter toolbar */}
      <TaskFilterToolbar
        projectId={projectId}
        filters={filters}
        onFiltersChange={setFilters}
        activeFilterCount={activeFilterCount}
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
                <CardTitle>{tasks.length === 0 ? "Немає задач" : "Задачі не знайдено"}</CardTitle>
                <CardDescription>
                  {tasks.length === 0
                    ? "У цьому проекті ще немає задач."
                    : "Жодна задача не відповідає обраним фільтрам. Спробуйте змінити критерії пошуку."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 && canEdit ? (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Створити першу задачу
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Очистити фільтри
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
                <CardTitle>{tasks.length === 0 ? "Немає задач" : "Задачі не знайдено"}</CardTitle>
                <CardDescription>
                  {tasks.length === 0
                    ? "У цьому проекті ще немає задач."
                    : "Жодна задача не відповідає обраним фільтрам. Спробуйте змінити критерії пошуку."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 && canEdit ? (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Створити першу задачу
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Очистити фільтри
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
