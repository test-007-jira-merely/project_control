"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRoleDialog } from "@/components/admin/user-role-dialog"
import { getAllUsers, getPendingUsers } from "@/lib/firebase/users"
import type { UserRole } from "@/context/auth-context"

interface User {
  id: string
  displayName: string | null
  email: string | null
  role: UserRole
  createdAt: any
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers()
        const pending = await getPendingUsers()

        setUsers(allUsers as User[])
        setPendingUsers(pending as User[])
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setPendingUsers(pendingUsers.filter((user) => user.id !== updatedUser.id))
    setIsDialogOpen(false)
    setSelectedUser(null)
  }

  if (loading) {
    return <div>Завантаження...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Управління користувачами</h1>
        <p className="text-muted-foreground">Керуйте користувачами та їх ролями в системі.</p>
      </div>

      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Користувачі, що очікують підтвердження</CardTitle>
            <CardDescription>Ці користувачі зареєструвалися і очікують підтвердження адміністратора.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button onClick={() => handleEditUser(user)}>Підтвердити</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Всі користувачі</CardTitle>
          <CardDescription>Список всіх користувачів системи.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Роль: {user.role === "admin" ? "Адміністратор" : user.role === "user" ? "Користувач" : "Гість"}
                  </p>
                </div>
                <Button variant="outline" onClick={() => handleEditUser(user)}>
                  Редагувати
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <UserRoleDialog
          user={selectedUser}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  )
}
