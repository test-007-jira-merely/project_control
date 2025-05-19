"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { updateUserRole } from "@/lib/firebase/users"
import { useToast } from "@/components/ui/use-toast"
import type { UserRole } from "@/context/auth-context"

interface User {
  id: string
  displayName: string | null
  email: string | null
  role: UserRole
  createdAt: any
}

interface UserRoleDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: (user: User) => void
}

export function UserRoleDialog({ user, open, onOpenChange, onUserUpdated }: UserRoleDialogProps) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await updateUserRole(user.id, role)
      toast({
        title: "Роль оновлено",
        description: `Роль користувача ${user.displayName} успішно оновлено.`,
      })
      onUserUpdated({ ...user, role })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося оновити роль користувача.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редагування ролі користувача</DialogTitle>
          <DialogDescription>
            Змініть роль користувача {user.displayName} ({user.email}).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Роль
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Виберіть роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest">Гість</SelectItem>
                <SelectItem value="user">Користувач</SelectItem>
                <SelectItem value="admin">Адміністратор</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
