"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateTask } from "@/lib/firebase/database"
import { TASK_STATUS_LABELS } from "@/lib/task-status"
import { useToast } from "@/components/ui/use-toast"
import type { Task } from "@/lib/firebase/database"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: string) => void
  loading: boolean
}

export function KanbanBoard({ tasks, onTaskUpdated, onTaskDeleted, loading }: KanbanBoardProps) {
  const { toast } = useToast()
  const [columns, setColumns] = useState({
    todo: {
      name: TASK_STATUS_LABELS.todo,
      items: tasks.filter((task) => task.status === "todo"),
    },
    "in-progress": {
      name: TASK_STATUS_LABELS["in-progress"],
      items: tasks.filter((task) => task.status === "in-progress"),
    },
    review: {
      name: TASK_STATUS_LABELS.review,
      items: tasks.filter((task) => task.status === "review"),
    },
    completed: {
      name: TASK_STATUS_LABELS.completed,
      items: tasks.filter((task) => task.status === "completed"),
    },
  })

  // Оновлюємо колонки при зміні задач
  useState(() => {
    setColumns({
      todo: {
        name: TASK_STATUS_LABELS.todo,
        items: tasks.filter((task) => task.status === "todo"),
      },
      "in-progress": {
        name: TASK_STATUS_LABELS["in-progress"],
        items: tasks.filter((task) => task.status === "in-progress"),
      },
      review: {
        name: TASK_STATUS_LABELS.review,
        items: tasks.filter((task) => task.status === "review"),
      },
      completed: {
        name: TASK_STATUS_LABELS.completed,
        items: tasks.filter((task) => task.status === "completed"),
      },
    })
  })

  const priorityMap = {
    low: { label: "Низький", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
    medium: { label: "Середній", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    high: { label: "Високий", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    urgent: { label: "Терміновий", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  }

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.droppableId === destination.droppableId) {
      // Переміщення в межах однієї колонки
      const column = columns[source.droppableId as keyof typeof columns]
      const copiedItems = [...column.items]
      const [removed] = copiedItems.splice(source.index, 1)
      copiedItems.splice(destination.index, 0, removed)

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      })
    } else {
      // Переміщення між колонками
      const sourceColumn = columns[source.droppableId as keyof typeof columns]
      const destColumn = columns[destination.droppableId as keyof typeof columns]
      const sourceItems = [...sourceColumn.items]
      const destItems = [...destColumn.items]
      const [removed] = sourceItems.splice(source.index, 1)

      // Оновлюємо статус задачі
      const updatedTask = { ...removed, status: destination.droppableId as Task["status"] }

      // Додаємо задачу до нової колонки
      destItems.splice(destination.index, 0, updatedTask)

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      })

      // Зберігаємо зміни в базі даних
      try {
        const result = await updateTask(updatedTask.id!, { status: updatedTask.status })
        onTaskUpdated(result as Task)
      } catch (error) {
        console.error("Error updating task status:", error)
        toast({
          variant: "destructive",
          title: "Помилка",
          description: "Не вдалося оновити статус задачі.",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-96 rounded-md border border-dashed p-4">
            <div className="h-full animate-pulse rounded-md bg-muted"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className="flex flex-col">
            <h3 className="mb-2 font-medium">{column.name}</h3>
            <Droppable droppableId={columnId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-1 flex-col gap-2 rounded-md border border-dashed p-2"
                >
                  {column.items.length > 0 ? (
                    column.items.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id!} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card className="cursor-grab active:cursor-grabbing">
                              <CardHeader className="p-3 pb-0">
                                <CardTitle className="line-clamp-1 text-sm">{task.title}</CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-1">
                                <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                                <div className="mt-2">
                                  <Badge className={priorityMap[task.priority].color}>
                                    {priorityMap[task.priority].label}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed p-2 text-center text-sm text-muted-foreground">
                      Немає задач
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
