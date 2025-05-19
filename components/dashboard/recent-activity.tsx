"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentActivity } from "@/lib/firebase/activity"
import { cn } from "@/lib/utils"
import { Check, FileEdit, Trash2, Plus, User } from "lucide-react"

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

  const getActivityIcon = (activity: Activity) => {
    switch (activity.action) {
      case "create":
        return <Plus className="h-4 w-4 text-green-500" />
      case "update":
        return <FileEdit className="h-4 w-4 text-blue-500" />
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "complete":
        return <Check className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getTypeIcon = (activity: Activity) => {
    switch (activity.type) {
      case "user":
        return <User className="h-4 w-4 text-purple-500" />
      default:
        return null
    }
  }

  return (
    <Card className={cn("col-span-4 bg-card", className)} {...props}>
      <CardHeader>
        <CardTitle>Остання активність</CardTitle>
        <CardDescription>Останні дії в системі</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div className="flex items-center" key={activity.id}>
                <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  {getActivityIcon(activity) || getTypeIcon(activity)}
                </div>
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
