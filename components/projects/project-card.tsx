import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { uk } from "date-fns/locale"
import { Link2Icon, GitBranchIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/lib/firebase/database"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusMap = {
    planning: { label: "Планування", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    active: { label: "Активний", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    completed: { label: "Завершений", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
    archived: { label: "Архівований", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  }

  const status = statusMap[project.status] || statusMap.planning

  return (
    <Card className="overflow-hidden bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1 text-xl">{project.name}</CardTitle>
          <Badge className={status.color}>{status.label}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-1.5">
          {project.startDate && (
            <div className="text-sm">
              <span className="font-medium">Початок:</span>{" "}
              {project.startDate.toLocaleDateString("uk-UA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}
          {project.endDate && (
            <div className="text-sm">
              <span className="font-medium">Кінець:</span>{" "}
              {project.endDate.toLocaleDateString("uk-UA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}

          {/* Посилання на завдання */}
          {project.taskLink && (
            <div className="flex items-center text-sm">
              <Link2Icon className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <a
                href={project.taskLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                Завдання
              </a>
            </div>
          )}

          {/* Посилання на Git репозиторій */}
          {project.gitRepository && (
            <div className="flex items-center text-sm">
              <GitBranchIcon className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <a
                href={project.gitRepository}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                Git репозиторій
              </a>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          Створено{" "}
          {formatDistanceToNow(new Date(project.createdAt.seconds * 1000), {
            addSuffix: true,
            locale: uk,
          })}
        </div>
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Переглянути
        </Link>
      </CardFooter>
    </Card>
  )
}
