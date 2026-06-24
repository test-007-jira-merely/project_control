"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { createTask } from "@/lib/firebase/database"
import { getProjectMembers } from "@/lib/firebase/database"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/firebase/database"
import { TASK_STATUSES } from "@/lib/constants"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Назва задачі має містити щонайменше 2 символи",
  }),
  description: z.string().min(5, {
    message: "Опис задачі має містити щонайменше 5 символів",
  }),
  status: z.enum(["todo", "in-progress", "review", "completed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
})

interface TaskCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onTaskCreated: (task: Task) => void
}

export function TaskCreateDialog({ open, onOpenChange, projectId, onTaskCreated }: TaskCreateDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignedTo: undefined,
      dueDate: undefined,
    },
  })

  useEffect(() => {
    const fetchMembers = async () => {
      if (open) {
        try {
          const projectMembers = await getProjectMembers(projectId)
          setMembers(projectMembers)
          console.log("Fetched members:", projectMembers)
        } catch (error) {
          console.error("Error fetching members:", error)
        }
      }
    }

    fetchMembers()
  }, [open, projectId])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const newTask = await createTask({
        projectId,
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assignedTo: values.assignedTo || null,
        dueDate: values.dueDate || null,
      })

      toast({
        title: "Задачу створено",
        description: "Нову задачу успішно створено.",
      })

      onOpenChange(false)
      form.reset()
      onTaskCreated(newTask as Task)
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося створити задачу. Спробуйте ще раз.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Створення нової задачі</DialogTitle>
          <DialogDescription>Заповніть форму, щоб створити нову задачу для проекту.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Назва задачі</FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть назву задачі" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Опис задачі</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Введіть опис задачі" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Виберіть статус" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">{TASK_STATUSES.todo.label}</SelectItem>
                        <SelectItem value="in-progress">{TASK_STATUSES["in-progress"].label}</SelectItem>
                        <SelectItem value="review">{TASK_STATUSES.review.label}</SelectItem>
                        <SelectItem value="completed">{TASK_STATUSES.completed.label}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пріоритет</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Виберіть пріоритет" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Низький</SelectItem>
                        <SelectItem value="medium">Середній</SelectItem>
                        <SelectItem value="high">Високий</SelectItem>
                        <SelectItem value="urgent">Терміновий</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Термін виконання</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP", { locale: uk }) : <span>Виберіть дату</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Створення..." : "Створити задачу"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
