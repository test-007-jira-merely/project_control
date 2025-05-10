"use client"

import { useState, useEffect } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getProjectMembers } from "@/lib/firebase/database"
import { ProjectMemberAddDialog } from "@/components/projects/project-member-add-dialog"

interface ProjectMembersProps {
  projectId: string
  userRole: string | null
}

interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: "owner" | "admin" | "member" | "viewer"
  joinedAt: any
  user: {
    id: string
    displayName: string
    email: string
    role: string
  }
}

export function ProjectMembers({ projectId, userRole }: ProjectMembersProps) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const canManageMembers = userRole === "owner" || userRole === "admin"

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const projectMembers = await getProjectMembers(projectId)
        setMembers(projectMembers)
      } catch (error) {
        console.error("Error fetching members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [projectId])

  const handleMemberAdded = (newMember: ProjectMember) => {
    setMembers((prevMembers) => [...prevMembers, newMember])
  }

  const roleMap = {
    owner: { label: "Власник", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    admin: { label: "Адміністратор", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    member: { label: "Учасник", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    viewer: { label: "Спостерігач", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Учасники проекту</h2>
        {canManageMembers && (
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Додати учасника
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-md border border-dashed p-4">
              <div className="h-full animate-pulse rounded-md bg-muted"></div>
            </div>
          ))}
        </div>
      ) : members.length > 0 ? (
        <div className="space-y-4">
          {members.map((member) => {
            const role = roleMap[member.role] || roleMap.member

            return (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.user.displayName,
                          )}&background=random&color=fff`}
                          alt={member.user.displayName}
                        />
                        <AvatarFallback>
                          {member.user.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <Badge className={role.color}>{role.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Немає учасників</CardTitle>
            <CardDescription>У цьому проекті ще немає учасників.</CardDescription>
          </CardHeader>
          <CardContent>
            {canManageMembers && (
              <Button onClick={() => setShowAddDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Додати першого учасника
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {canManageMembers && (
        <ProjectMemberAddDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          projectId={projectId}
          onMemberAdded={handleMemberAdded}
          existingMembers={members}
        />
      )}
    </div>
  )
}
