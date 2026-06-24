"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProjectTasks, getProjectMembers } from "@/lib/firebase/database"
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog"
import { TaskCard } from "@/components/tasks/task-card"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskFilterToolbar, type TaskFilters } from "@/components/tasks/task-filter-toolbar"
import type { Task, ProjectMember } from "@/lib/firebase/database"

interface ProjectTasksProps {
  projectId: string
  canEdit: boolean
}

const INITIAL_FILTERS: TaskFilters = {
  search: "",
  status: "all",
  priority: "all",
  assignee: "all",
}

export function ProjectTasks({ projectId, canEdit }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>(INITIAL_FILTERS)

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

  const fetchMembers = async () => {
    try {
      const projectMembers = await getProjectMembers(projectId)
      setMembers(projectMembers)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTasks(), fetchMembers()])
  }, [projectId])

  const refreshTasks = () => fetchTasks()

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Пошук за текстом (назва або опис)
      const matchesSearch =
        filters.search === "" ||
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())

      // Фільтр за статусом
      const matchesStatus = filters.status === "all" || task.status === filters.status

      // Фільтр за пріоритетом
      const matchesPriority = filters.priority === "all" || task.priority === filters.priority

      // Фільтр за виконавцем
      const matchesAssignee =
        filters.assignee === "all" ||
        (filters.assignee === "unassigned" ? !task.assignedTo : task.assignedTo === filters.assignee)

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [tasks, filters])

  const EmptySearchState = () => (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <Search className="mb-4 h-12 w-12 text-muted-foreground" />
      <CardTitle>Нічого не знайдено</CardTitle>
      <CardDescription>Спробуйте змінити фільтри пошуку.</CardDescription>
      <Button variant="link" onClick={() => setFilters(INITIAL_FILTERS)}>
        Очистити всі фільтри
      </Button>
    </Card>
  )

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

      <TaskFilterToolbar filters={filters} setFilters={setFilters} members={members} />

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
              onTaskUpdated={refreshTasks}
              onTaskDeleted={refreshTasks}
              loading={loading}
            />
          ) : tasks.length > 0 ? (
            <EmptySearchState />
          ) : (
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
                  onTaskUpdated={refreshTasks}
                  onTaskDeleted={refreshTasks}
                />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <EmptySearchState />
          ) : (
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
          )}
        </TabsContent>
      </Tabs>

      {canEdit && (
        <TaskCreateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          projectId={projectId}
          onTaskCreated={refreshTasks}
        />
      )}
    </div>
  )
}
