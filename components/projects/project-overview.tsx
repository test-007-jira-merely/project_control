import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/lib/firebase/database"
import { PROJECT_STATUS_MAP } from "@/lib/constants"

interface ProjectOverviewProps {
  project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const status = PROJECT_STATUS_MAP[project.status] || PROJECT_STATUS_MAP.planning

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Інформація про проект</CardTitle>
          <CardDescription>Основна інформація про проект та його статус.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Статус</h3>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
          <div>
            <h3 className="font-medium">Опис</h3>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Дата початку</h3>
              <p className="text-sm text-muted-foreground">
                {project.startDate
                  ? project.startDate.toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Не вказано"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Дата завершення</h3>
              <p className="text-sm text-muted-foreground">
                {project.endDate
                  ? project.endDate.toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Не вказано"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
