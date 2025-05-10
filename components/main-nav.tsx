"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.role === "admin"

  const routes = [
    {
      href: "/dashboard",
      label: "Дашборд",
      active: pathname === "/dashboard",
    },
    {
      href: "/projects",
      label: "Проекти",
      active: pathname === "/projects" || pathname.startsWith("/projects/"),
    },
    {
      href: "/tasks",
      label: "Задачі",
      active: pathname === "/tasks" || pathname.startsWith("/tasks/"),
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Адміністрування",
            active: pathname === "/admin" || pathname.startsWith("/admin/"),
          },
        ]
      : []),
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
