"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UserStats } from "@/components/dashboard/user-stats"
import { auth } from "@/lib/firebase/config"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false)
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push("/auth/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Завантаження...</h1>
          <p className="text-muted-foreground">Перевіряємо ваш обліковий запис</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Дашборд" text="Огляд ваших проектів та задач" />
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
