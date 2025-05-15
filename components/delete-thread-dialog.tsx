"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  threadName: string
  onDeleteThread: () => void
}

export function DeleteThreadDialog({ open, onOpenChange, threadName, onDeleteThread }: DeleteThreadDialogProps) {
  const handleDelete = () => {
    onDeleteThread()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Thread
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold">#{threadName}</span>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Thread
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
