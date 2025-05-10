"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { addProjectMember } from "@/lib/firebase/database"
import { getAllUsers } from "@/lib/firebase/users"

const formSchema = z.object({
  userId: z.string().min(1, {
    message: "Виберіть користувача",
  }),
  role: z.enum(["admin", "member", "viewer"]),
})

interface ProjectMemberAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onMemberAdded: (member: any) => void
  existingMembers: any[]
}

export function ProjectMemberAddDialog({
  open,
  onOpenChange,
  projectId,
  onMemberAdded,
  existingMembers,
}: ProjectMemberAddDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      role: "member",
    },
  })

  // Завантажуємо користувачів при відкритті діалогу
  const handleOpenChange = async (open: boolean) => {
    onOpenChange(open)

    if (open && users.length === 0) {
      try {
        const allUsers = await getAllUsers()
        setUsers(allUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          variant: "destructive",
          title: "Помилка",
          description: "Не вдалося завантажити список користувачів.",
        })
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Перевіряємо, чи користувач вже є учасником проекту
      const isExistingMember = existingMembers.some((member) => member.userId === values.userId)

      if (isExistingMember) {
        toast({
          variant: "destructive",
          title: "Помилка",
          description: "Цей користувач вже є учасником проекту.",
        })
        setIsLoading(false)
        return
      }

      const newMember = await addProjectMember(projectId, values.userId, values.role)

      toast({
        title: "Учасника додано",
        description: "Користувача успішно додано до проекту.",
      })

      onOpenChange(false)
      form.reset()
      onMemberAdded(newMember)
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося додати учасника. Спробуйте ще раз.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Фільтруємо користувачів за пошуковим запитом
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return user.displayName?.toLowerCase().includes(searchLower) || user.email?.toLowerCase().includes(searchLower)
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Додати учасника проекту</DialogTitle>
          <DialogDescription>Виберіть користувача та призначте йому роль у проекті.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Пошук користувача
              </label>
              <Input
                id="search"
                placeholder="Введіть ім'я або email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Користувач</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Виберіть користувача" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.displayName} ({user.email})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          {searchTerm ? "Користувачів не знайдено" : "Немає доступних користувачів"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Роль у проекті</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Виберіть роль" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Адміністратор</SelectItem>
                      <SelectItem value="member">Учасник</SelectItem>
                      <SelectItem value="viewer">Спостерігач</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Додавання..." : "Додати учасника"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
