"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectTasks } from "@/components/projects/project-tasks"
import { ProjectMembers } from "@/components/projects/project-members"
import { ProjectSettings } from "@/components/projects/project-settings"
import { getProject, getUserProjectRole } from "@/lib/firebase/database"
import { useAuth } from "@/context/auth-context"
import type { Project } from "@/lib/firebase/database"


export default function ProjectPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      if (!user) return

      try {
        const projectData = await getProject(id)
        setProject(projectData as Project)

        // Отримуємо роль користувача в проекті
        const role = await getUserProjectRole(id, user.uid)
        setUserRole(role)
      } catch (error) {
        console.error("Error fetching project:", error)
        router.push("/projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, user, router])

  if (loading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Завантаження..." text="Отримання інформації про проект..." />
        <div className="grid gap-4">
          <div className="h-40 rounded-md border border-dashed p-4">
            <div className="h-full animate-pulse rounded-md bg-muted"></div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!project) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Проект не знайдено" text="Проект не існує або у вас немає доступу до нього." />
      </DashboardShell>
    )
  }

  const canEdit = userRole === "owner" || userRole === "admin" || user?.role === "admin"

  return (
    <DashboardShell>
      <DashboardHeader heading={project.name} text={project.description} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="tasks">Задачі</TabsTrigger>
          <TabsTrigger value="members">Учасники</TabsTrigger>
          {canEdit && <TabsTrigger value="settings">Налаштування</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview project={project} />
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <ProjectTasks projectId={id} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <ProjectMembers projectId={id} userRole={userRole} />
        </TabsContent>
        {canEdit && (
          <TabsContent value="settings" className="space-y-4">
            <ProjectSettings project={project} setProject={setProject} />
          </TabsContent>
        )}
      </Tabs>
    </DashboardShell>
  )
}
