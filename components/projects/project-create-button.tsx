"use client"

import { useState } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { ProjectCreateDialog } from "./project-create-dialog"
import { PlusCircle } from "lucide-react"

export interface ProjectCreateButtonProps extends ButtonProps {
  onProjectCreated?: () => Promise<void>;
}

export function ProjectCreateButton({ 
  onProjectCreated = async () => {}, 
  variant = "outline", 
  ...props 
}: ProjectCreateButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button 
        variant={variant}
        onClick={() => setOpen(true)} 
        {...props}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Новий проект
      </Button>
      <ProjectCreateDialog
        open={open}
        onOpenChange={setOpen}
        onProjectCreated={onProjectCreated}
      />
    </>
  )
}