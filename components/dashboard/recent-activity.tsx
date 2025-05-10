"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentActivity } from "@/lib/firebase/activity"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: "project" | "task" | "user"
  action: "create" | "update" | "delete" | "complete"
  title: string
  timestamp: Date
  user: {
    id: string
    name: string
  }
}

interface RecentActivityProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RecentActivity({ className, ...props }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const fetchActivities = async () => {
      const recentActivities = await getRecentActivity()
      setActivities(recentActivities)
    }

    fetchActivities()
  }, [])

  return (
    <Card className={cn("col-span-4", className)} {...props}>
      <CardHeader>
        <CardTitle>Остання активність</CardTitle>
        <CardDescription>Останні дії в системі</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div className="flex items-center" key={activity.id}>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.user.name}</p>
                  <p className="text-sm text-muted-foreground">{getActivityText(activity)}</p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, {
                    addSuffix: true,
                    locale: uk,
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Немає активності</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getActivityText(activity: Activity): string {
  const actionMap = {
    create: "створив",
    update: "оновив",
    delete: "видалив",
    complete: "завершив",
  }

  const typeMap = {
    project: "проект",
    task: "задачу",
    user: "користувача",
  }

  return `${actionMap[activity.action]} ${typeMap[activity.type]} "${activity.title}"`
}
