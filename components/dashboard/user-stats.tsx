"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getUserStats } from "@/lib/firebase/stats"
import { cn } from "@/lib/utils"

interface UserStatsProps extends React.HTMLAttributes<HTMLDivElement> {}

interface UserStatsData {
  tasksCompleted: number
  tasksAssigned: number
  projectsInvolved: number
  completionRate: number
}

export function UserStats({ className, ...props }: UserStatsProps) {
  const [stats, setStats] = useState<UserStatsData>({
    tasksCompleted: 0,
    tasksAssigned: 0,
    projectsInvolved: 0,
    completionRate: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const userStats = await getUserStats()
      setStats(userStats)
    }

    fetchStats()
  }, [])

  return (
    <Card className={cn("col-span-3", className)} {...props}>
      <CardHeader>
        <CardTitle>Ваша статистика</CardTitle>
        <CardDescription>Ваш прогрес та активність</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Виконання задач</div>
            <div className="text-sm text-muted-foreground">
              {stats.tasksCompleted} / {stats.tasksAssigned}
            </div>
          </div>
          <Progress value={stats.completionRate} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Задачі виконано</div>
            <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Проектів</div>
            <div className="text-2xl font-bold">{stats.projectsInvolved}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
