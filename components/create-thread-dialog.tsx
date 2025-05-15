"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Hash } from "lucide-react"

interface CreateThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateThread: (name: string, description: string) => void
  existingThreadNames: string[]
}

export function CreateThreadDialog({
  open,
  onOpenChange,
  onCreateThread,
  existingThreadNames,
}: CreateThreadDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate thread name
    if (!name.trim()) {
      setError("Thread name is required")
      return
    }

    // Check if thread name already exists (case insensitive)
    if (existingThreadNames.some((threadName) => threadName.toLowerCase() === name.trim().toLowerCase())) {
      setError("A thread with this name already exists")
      return
    }

    // Create thread
    onCreateThread(name.trim(), description.trim())

    // Reset form
    setName("")
    setDescription("")
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Create New Thread
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
            <Button type="submit">Create Thread</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
