"use client"

import { useMemo } from "react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateTask } from "@/lib/firebase/database"
import { useToast } from "@/components/ui/use-toast"
import { priorityMap } from "@/components/tasks/task-filters"
import type { Task } from "@/lib/firebase/database"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: string) => void
  loading: boolean
}

type KanbanColumnId = Task["status"]

type KanbanColumn = {
  name: string
  items: Task[]
}

const columnMetadata: Record<KanbanColumnId, string> = {
  todo: "Очікує",
  "in-progress": "В процесі",
  review: "На перевірці",
  completed: "Завершено",
}

function buildColumns(tasks: Task[]): Record<KanbanColumnId, KanbanColumn> {
  const columns: Record<KanbanColumnId, KanbanColumn> = {
    todo: { name: columnMetadata.todo, items: [] },
    "in-progress": { name: columnMetadata["in-progress"], items: [] },
    review: { name: columnMetadata.review, items: [] },
    completed: { name: columnMetadata.completed, items: [] },
  }

  tasks.forEach((task) => {
    if (columns[task.status]) {
      columns[task.status].items.push(task)
    }
  })

  return columns
}

export function KanbanBoard({ tasks, onTaskUpdated, onTaskDeleted, loading }: KanbanBoardProps) {
  const { toast } = useToast()

  // Use useMemo to derive columns from tasks to avoid extra render cycles and redundant state.
  const columns = useMemo(() => buildColumns(tasks), [tasks])

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceColumnId = source.droppableId as KanbanColumnId
    const destinationColumnId = destination.droppableId as KanbanColumnId

    if (sourceColumnId === destinationColumnId) {
      // Internal reordering not implemented as there's no order field in the schema.
      return
    }

    const sourceColumn = columns[sourceColumnId]
    const removed = sourceColumn.items[source.index]
    const updatedTask = { ...removed, status: destinationColumnId }

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
