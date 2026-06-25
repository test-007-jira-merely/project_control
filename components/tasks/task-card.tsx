"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TaskEditDialog } from "@/components/tasks/task-edit-dialog"
import { deleteTask } from "@/lib/firebase/database"
import { TASK_STATUS_META } from "@/lib/task-status"
import { useToast } from "@/components/ui/use-toast"
import type { Task } from "@/lib/firebase/database"

interface TaskCardProps {
  task: Task
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: string) => void
}

export function TaskCard({ task, onTaskUpdated, onTaskDeleted }: TaskCardProps) {
  const { toast } = useToast()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const priorityMap = {
    low: { label: "Низький", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
    medium: { label: "Середній", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    high: { label: "Високий", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    urgent: { label: "Терміновий", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  }

  const status = TASK_STATUS_META[task.status] || TASK_STATUS_META.todo
  const priority = priorityMap[task.priority] || priorityMap.medium

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTask(task.id!)
      toast({
        title: "Задачу видалено",
        description: "Задачу успішно видалено.",
      })
      onTaskDeleted(task.id!)
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося видалити задачу. Спробуйте ще раз.",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1 text-lg">{task.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Редагувати
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Видалити
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2">
            <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={status.color}>{status.label}</Badge>
              <Badge className={priority.color}>{priority.label}</Badge>
            </div>
            {task.dueDate && (
              <div className="text-xs text-muted-foreground">
                Термін: {task.dueDate.toDateString()}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="text-xs text-muted-foreground">
            Створено{" "}
            {formatDistanceToNow(new Date(task.createdAt.seconds * 1000), {
              addSuffix: true,
              locale: uk,
            })}
          </div>
        </CardFooter>
      </Card>

      <TaskEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        task={task}
        onTaskUpdated={onTaskUpdated}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Ця дія призведе до видалення задачі "{task.title}". Ця дія незворотна.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isDeleting ? "Видалення..." : "Видалити"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
