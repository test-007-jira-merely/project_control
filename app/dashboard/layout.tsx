import type React from "react"
import { SiteHeader } from "@/components/site-header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container flex-1 space-y-4 p-8 pt-6">{children}</div>
    </div>
  )
}
