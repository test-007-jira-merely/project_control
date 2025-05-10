"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectCreateDialog } from "@/components/projects/project-create-dialog"

interface ProjectCreateButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function ProjectCreateButton({ variant = "outline" }: ProjectCreateButtonProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <>
      <Button variant={variant} onClick={() => setShowCreateDialog(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Новий проект
      </Button>
      <ProjectCreateDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
