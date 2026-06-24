"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { getProjectStats, getTaskStats } from "@/lib/firebase/stats"
import { TASK_STATUSES } from "@/lib/constants"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function ProjectChart() {
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
    archived: 0,
  })

  const [taskStats, setTaskStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    review: 0,
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

  // Фільтруємо нульові значення для проектів
  const projectData = [
    { name: "Активні", value: projectStats.active },
    { name: "Завершені", value: projectStats.completed },
    { name: "Планування", value: projectStats.planning },
    { name: "Архівовані", value: projectStats.archived },
  ].filter((item) => item.value > 0)

  // Фільтруємо нульові значення для задач
  const taskData = [
    { name: TASK_STATUSES.todo.pluralLabel, value: taskStats.todo },
    { name: TASK_STATUSES["in-progress"].pluralLabel, value: taskStats.inProgress },
    { name: TASK_STATUSES.review.pluralLabel, value: taskStats.review },
    { name: TASK_STATUSES.completed.pluralLabel, value: taskStats.completed },
  ].filter((item) => item.value > 0)

  // Фільтруємо нульові значення для стовпчикової діаграми
  const barData = [
    {
      name: "Проекти",
      активні: projectStats.active > 0 ? projectStats.active : null,
      завершені: projectStats.completed > 0 ? projectStats.completed : null,
    },
    {
      name: "Задачі",
      активні:
        taskStats.todo + taskStats.inProgress + taskStats.review > 0
          ? taskStats.todo + taskStats.inProgress + taskStats.review
          : null,
      завершені: taskStats.completed > 0 ? taskStats.completed : null,
    },
  ]

  return (
    <Card className="col-span-full bg-card">
      <CardHeader>
        <CardTitle>Статистика проектів та задач</CardTitle>
        <CardDescription>Візуальне представлення стану проектів та задач</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col space-y-2">
          <h3 className="text-center text-sm font-medium">Розподіл проектів за статусом</h3>
          {projectData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-muted-foreground">Немає даних для відображення</p>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <h3 className="text-center text-sm font-medium">Розподіл задач за статусом</h3>
          {taskData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-muted-foreground">Немає даних для відображення</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
