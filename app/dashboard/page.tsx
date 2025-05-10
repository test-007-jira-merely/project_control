"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UserStats } from "@/components/dashboard/user-stats"
import { useAuth } from "@/context/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text={`Вітаємо, ${user?.displayName || "користувач"}! Ось огляд ваших проектів та задач.`}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentActivity className="col-span-4" />
        <UserStats className="col-span-3" />
      </div>
    </DashboardShell>
  )
}
