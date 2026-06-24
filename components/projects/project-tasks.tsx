"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
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

export function ProjectTasks({ projectId, canEdit }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: "all",
    priority: "all",
    assignee: "all",
  })

  const fetchTasksAndMembers = async () => {
    try {
      const [projectTasks, projectMembers] = await Promise.all([
        getProjectTasks(projectId),
        getProjectMembers(projectId),
      ])
      setTasks(projectTasks as Task[])
      setMembers(projectMembers)
    } catch (error) {
      console.error("Error fetching tasks or members:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasksAndMembers()
  }, [projectId])

  const handleTaskCreated = (newTask: Task) => {
    fetchTasksAndMembers();
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    fetchTasksAndMembers();
  }

  const handleTaskDeleted = (taskId: string) => {
    fetchTasksAndMembers();
  }

  const filteredTasks = tasks.filter((task) => {
    const searchLower = filters.search.toLowerCase()
    const matchesSearch =
      !filters.search ||
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower)
    const matchesStatus = filters.status === "all" || task.status === filters.status
    const matchesPriority = filters.priority === "all" || task.priority === filters.priority
    const matchesAssignee =
      filters.assignee === "all" ||
      (filters.assignee === "unassigned" ? !task.assignedTo : task.assignedTo === filters.assignee)

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  })

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

      {!loading && tasks.length > 0 && (
        <TaskFilterToolbar filters={filters} onFilterChange={setFilters} members={members} />
      )}

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
          ) : tasks.length > 0 ? (
            filteredTasks.length > 0 ? (
              <KanbanBoard
                tasks={filteredTasks}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                loading={loading}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Не знайдено задач</CardTitle>
                  <CardDescription>За вашими фільтрами не знайдено жодної задачі.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setFilters({ search: "", status: "all", priority: "all", assignee: "all" })}>
                    Скинути фільтри
                  </Button>
                </CardContent>
              </Card>
            )
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
          ) : tasks.length > 0 ? (
            filteredTasks.length > 0 ? (
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
                  <CardTitle>Не знайдено задач</CardTitle>
                  <CardDescription>За вашими фільтрами не знайдено жодної задачі.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setFilters({ search: "", status: "all", priority: "all", assignee: "all" })}>
                    Скинути фільтри
                  </Button>
                </CardContent>
              </Card>
            )
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
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}
