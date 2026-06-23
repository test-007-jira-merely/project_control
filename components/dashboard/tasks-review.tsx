"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { getTasksInReview, updateTaskStatus } from "@/lib/firebase/database"
import { useToast } from "@/components/ui/use-toast"
import { getTaskStatusMeta } from "@/lib/task-statuses"
import type { Task } from "@/lib/firebase/database"

export function TasksInReview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const reviewStatus = getTaskStatusMeta("review")

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const reviewTasks = await getTasksInReview()
        setTasks(reviewTasks)
      } catch (error) {
        console.error("Error fetching tasks in review:", error)
        toast({
          variant: "destructive",
          title: "Помилка",
          description: "Не вдалося завантажити задачі на перевірці",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [toast])

  const handleTaskAction = async (taskId: string, newStatus: "completed" | "in-progress") => {
    setActionLoading(taskId)
    try {
      await updateTaskStatus(taskId, newStatus)

      // Оновлюємо локальний стан
      setTasks(tasks.filter((task) => task.id !== taskId))

      toast({
        title: newStatus === "completed" ? "Задачу завершено" : "Задачу повернуто на доопрацювання",
        description: "Статус задачі успішно оновлено",
      })
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося оновити статус задачі",
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Card className="col-span-full bg-card">
      <CardHeader>
        <CardTitle>Задачі на перевірці</CardTitle>
        <CardDescription>Задачі, які очікують вашого перегляду та затвердження</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline" className={reviewStatus.color}>
                        {reviewStatus.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>
                        Проект:{" "}
                        <Link href={`/projects/${task.projectId}`} className="hover:underline">
                          {task.projectId || "Невідомий проект"}
                        </Link>
                      </span>
                      <span>•</span>
                      <span>
                        Оновлено{" "}
                        {formatDistanceToNow(new Date(task.updatedAt?.seconds * 1000 || Date.now()), {
                          addSuffix: true,
                          locale: uk,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 sm:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 border-red-200 bg-red-100 text-red-800 hover:bg-red-200 dark:border-red-800 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      onClick={() => handleTaskAction(task.id!, "in-progress")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === task.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      На доопрацювання
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 border-green-200 bg-green-100 text-green-800 hover:bg-green-200 dark:border-green-800 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      onClick={() => handleTaskAction(task.id!, "completed")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === task.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      Затвердити
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-muted-foreground">Немає задач, які очікують перевірки</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
