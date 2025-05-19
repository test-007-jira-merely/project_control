"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, UserPlus, Search, UserX, Shield, User, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useToast } from "@/components/ui/use-toast"
import {
  getProjectMembers,
  searchUsersByEmail,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
} from "@/lib/firebase/database"
import type { ProjectMember, User as UserType } from "@/lib/firebase/database"

const formSchema = z.object({
  email: z.string().email({
    message: "Введіть правильний email",
  }),
})

interface ProjectMembersProps {
  projectId: string
}

export function ProjectMembers({ projectId }: ProjectMembersProps) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">("member")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<{ email: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const projectMembers = await getProjectMembers(projectId)
        setMembers(projectMembers)
      } catch (error) {
        console.error("Error fetching project members:", error)
        toast({
          variant: "destructive",
          title: "Помилка",
          description: "Не вдалося завантажити учасників проекту",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [projectId, toast])

  const onSearch = async (data: { email: string }) => {
    if (!data.email) return

    setSearching(true)
    setSearchResults([])

    try {
      const users = await searchUsersByEmail(data.email)

      // Фільтруємо користувачів, які вже є учасниками проекту
      const memberUserIds = members.map((member) => member.userId)
      const filteredUsers = users.filter((user) => !memberUserIds.includes(user.id))

      setSearchResults(filteredUsers)
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося знайти користувачів",
      })
    } finally {
      setSearching(false)
    }
  }

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user)
    setShowAddDialog(true)
  }

  const handleAddMember = async () => {
    if (!selectedUser) return

    setActionLoading(true)

    try {
      const newMember = await addProjectMember(projectId, {
        userId: selectedUser.id,
        userName: selectedUser.displayName,
        userEmail: selectedUser.email,
        role: selectedRole,
      })

      setMembers((prev) => [newMember, ...prev])
      setSelectedUser(null)
      setSelectedRole("member")
      setShowAddDialog(false)
      setSearchResults([])
      form.reset()

      toast({
        title: "Учасника додано",
        description: `${selectedUser.displayName} успішно додано до проекту`,
      })
    } catch (error: any) {
      console.error("Error adding project member:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: error.message || "Не вдалося додати учасника",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return

    setActionLoading(true)

    try {
      await removeProjectMember(memberToRemove.id)

      setMembers((prev) => prev.filter((member) => member.id !== memberToRemove.id))
      setMemberToRemove(null)
      setShowRemoveDialog(false)

      toast({
        title: "Учасника видалено",
        description: `${memberToRemove.userName} успішно видалено з проекту`,
      })
    } catch (error: any) {
      console.error("Error removing project member:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: error.message || "Не вдалося видалити учасника",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: "admin" | "member") => {
    try {
      await updateProjectMemberRole(memberId, newRole)

      setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, role: newRole } : member)))

      toast({
        title: "Роль оновлено",
        description: "Роль учасника успішно оновлено",
      })
    } catch (error: any) {
      console.error("Error updating member role:", error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: error.message || "Не вдалося оновити роль учасника",
      })
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Власник</Badge>
      case "admin":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Адміністратор</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Учасник</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Учасники проекту</CardTitle>
        <CardDescription>Управління учасниками проекту</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSearch)} className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Пошук за email" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Пошук"}
              </Button>
            </form>
          </Form>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Результати пошуку</h3>
              <div className="rounded-md border">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border-b p-3 last:border-0">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleSelectUser(user)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Додати
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Учасники ({members.length})</h3>
            {loading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : members.length > 0 ? (
              <div className="rounded-md border">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between border-b p-3 last:border-0">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(member.userName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{member.userName}</p>
                          {getRoleBadge(member.role)}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                      </div>
                    </div>
                    {member.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role === "member" && (
                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "admin")}>
                              <Shield className="mr-2 h-4 w-4" />
                              Зробити адміністратором
                            </DropdownMenuItem>
                          )}
                          {member.role === "admin" && (
                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "member")}>
                              <User className="mr-2 h-4 w-4" />
                              Зробити учасником
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setMemberToRemove(member)
                              setShowRemoveDialog(true)
                            }}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Видалити
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center rounded-md border">
                <p className="text-muted-foreground">Немає учасників</p>
              </div>
            )}
          </div>
        </div>

        <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Додати учасника</AlertDialogTitle>
              <AlertDialogDescription>Виберіть роль для нового учасника проекту.</AlertDialogDescription>
            </AlertDialogHeader>
            {selectedUser && (
              <div className="flex items-center space-x-3 py-2">
                <Avatar>
                  <AvatarImage src={selectedUser.photoURL || "/placeholder.svg"} />
                  <AvatarFallback>{getInitials(selectedUser.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.displayName}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            )}
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as "admin" | "member")}>
              <SelectTrigger>
                <SelectValue placeholder="Виберіть роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Адміністратор</SelectItem>
                <SelectItem value="member">Учасник</SelectItem>
              </SelectContent>
            </Select>
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddMember} disabled={actionLoading}>
                {actionLoading ? "Додавання..." : "Додати"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Видалити учасника</AlertDialogTitle>
              <AlertDialogDescription>
                Ви впевнені, що хочете видалити цього учасника з проекту? Ця дія не може бути скасована.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {memberToRemove && (
              <div className="flex items-center space-x-3 py-2">
                <Avatar>
                  <AvatarFallback>{getInitials(memberToRemove.userName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{memberToRemove.userName}</p>
                  <p className="text-sm text-muted-foreground">{memberToRemove.userEmail}</p>
                </div>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveMember}
                disabled={actionLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {actionLoading ? "Видалення..." : "Видалити"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
