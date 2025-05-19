"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Link2Icon, GitBranchIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { updateProject } from "@/lib/firebase/database"
import type { Project } from "@/lib/firebase/database"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Назва проекту повинна містити щонайменше 3 символи",
  }),
  description: z.string().min(10, {
    message: "Опис проекту повинен містити щонайменше 10 символів",
  }),
  status: z.enum(["planning", "active", "completed", "archived"], {
    required_error: "Будь ласка, виберіть статус проекту",
  }),
  taskLink: z.string().url({ message: "Введіть правильне URL" }).optional().or(z.literal("")),
  gitRepository: z.string().url({ message: "Введіть правильне URL" }).optional().or(z.literal("")),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface ProjectDetailsProps {
  project: Project
  onProjectUpdated: (project: Project) => void
}

export function ProjectDetails({ project, onProjectUpdated }: ProjectDetailsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      status: project.status,
      taskLink: project.taskLink || "",
      gitRepository: project.gitRepository || "",
      startDate: project.startDate,
      endDate: project.endDate,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const updatedProject = await updateProject(project.id, data)
      onProjectUpdated(updatedProject)
      toast({
        title: "Проект оновлено",
        description: "Дані проекту успішно оновлено",
      })
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося оновити проект. Спробуйте ще раз.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Деталі проекту</CardTitle>
        <CardDescription>Перегляд та редагування інформації про проект</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Назва проекту</FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть назву проекту" {...field} />
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
                  <FormLabel>Опис проекту</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Введіть опис проекту" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус проекту</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Виберіть статус проекту" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planning">Планування</SelectItem>
                      <SelectItem value="active">Активний</SelectItem>
                      <SelectItem value="completed">Завершений</SelectItem>
                      <SelectItem value="archived">Архівований</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taskLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Посилання на завдання</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Link2Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="https://example.com/task" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Посилання на зовнішнє завдання або документацію</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gitRepository"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Git репозиторій</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <GitBranchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="https://github.com/username/repo" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Посилання на Git репозиторій проекту</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата початку</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: uk }) : <span>Виберіть дату</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Необов&apos;язкове поле</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата завершення</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: uk }) : <span>Виберіть дату</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Необов&apos;язкове поле</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <CardFooter className="flex justify-end px-0 pb-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" /> Збереження...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Зберегти зміни
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
