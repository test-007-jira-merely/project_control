"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjectStats, getTaskStats } from "@/lib/firebase/stats"
import { BarChart, CheckCircle, ListChecks, FolderKanban } from "lucide-react"
import { TASK_STATUSES } from "@/lib/constants"

export function DashboardStats() {
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  })

  const [taskStats, setTaskStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const pStats = await getProjectStats()
      const tStats = await getTaskStats()

      setProjectStats(pStats)
      setTaskStats(tStats)
    }

    fetchStats()
  }, [])

  return (
    <>
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всього проектів</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {projectStats.active} активних, {projectStats.completed} завершених
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Активні проекти</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectStats.active}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((projectStats.active / (projectStats.total || 1)) * 100)}% від загальної кількості
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всього задач</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {taskStats.todo} {TASK_STATUSES.todo.pluralLabel.toLowerCase()}, {taskStats.inProgress} {TASK_STATUSES["in-progress"].pluralLabel.toLowerCase()}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Завершені задачі</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskStats.completed}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((taskStats.completed / (taskStats.total || 1)) * 100)}% від загальної кількості
          </p>
        </CardContent>
      </Card>
    </>
  )
}
