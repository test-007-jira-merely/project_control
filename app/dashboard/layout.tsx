import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { AuthGuard } from "@/components/auth-guard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard allowedRoles={["user", "admin"]}>
      <div className="flex min-h-screen flex-col items-center">
        <SiteHeader />
        <div className="container flex-1 space-y-4 p-8 pt-6">{children}</div>
      </div>
    </AuthGuard>
  )
}
