"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProjectTasks } from "@/lib/firebase/database"
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog"
import { TaskCard } from "@/components/tasks/task-card"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import type { Task } from "@/lib/firebase/database"

interface ProjectTasksProps {
  projectId: string
  canEdit: boolean
}

export function ProjectTasks({ projectId, canEdit }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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
            <KanbanBoard
            tasks={tasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            loading={loading}
          />
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
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
