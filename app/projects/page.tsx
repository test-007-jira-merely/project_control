"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectCreateButton } from "@/components/projects/project-create-button"
import { getUserProjects } from "@/lib/firebase/database"
import { useAuth } from "@/context/auth-context"
import type { Project } from "@/lib/firebase/database"

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    if (!user) return

    try {
      const userProjects = await getUserProjects(user.uid)
      setProjects(userProjects)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Projects" text="Керуйте своїми проектами та задачами.">
        <ProjectCreateButton onProjectCreated={fetchProjects} />
      </DashboardHeader>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-md border border-dashed p-4">
              <div className="h-full animate-pulse rounded-md bg-muted"></div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex h-[450px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">Немає проектів</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              У вас ще немає проектів. Створіть свій перший проект, щоб почати роботу.
            </p>
            <ProjectCreateButton onProjectCreated={fetchProjects} />
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
