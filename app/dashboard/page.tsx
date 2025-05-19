"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UserStats } from "@/components/dashboard/user-stats"
import { ProjectChart } from "@/components/dashboard/project-chart"
import { TasksInReview } from "@/components/dashboard/tasks-review"
import { useAuth } from "@/context/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text={`Вітаємо, ${user?.displayName || "користувач"}! Ось огляд ваших проектів та задач.`}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>
      {isAdmin && (<TasksInReview />)}
      <ProjectChart />
      <div className="grid md:grid-cols-1 lg:grid-cols-7">
        <RecentActivity className="col-span-7" />
      </div>
    </DashboardShell>
  )
}
