"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import type { Thread } from "@/lib/types"

interface EditThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thread: Thread
  onEditThread: (name: string, description: string) => void
  existingThreadNames: string[]
}

export function EditThreadDialog({
  open,
  onOpenChange,
  thread,
  onEditThread,
  existingThreadNames = [],
}: EditThreadDialogProps) {
  const [name, setName] = useState(thread.name)
  const [description, setDescription] = useState(thread.description)
  const [error, setError] = useState<string | null>(null)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(thread.name)
      setDescription(thread.description)
      setError(null)
    }
  }, [open, thread])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Thread name is required")
      return
    }

    // Only check for duplicate names if it's different from current name
    if (name.trim().toLowerCase() !== thread.name.toLowerCase()) {
      const isDuplicate = existingThreadNames.some(
        threadName => threadName.toLowerCase() === name.trim().toLowerCase()
      )
      if (isDuplicate) {
        setError("A thread with this name already exists")
        return
      }
    }

    onEditThread(name.trim(), description.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Thread
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="thread-name" className="text-sm font-medium">
              Thread Name
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">#</span>
              <Input
                id="thread-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                placeholder="general"
                className="pl-7"
                maxLength={20}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thread-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="thread-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this thread about?"
              className="resize-none"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{description.length}/100 characters</p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
