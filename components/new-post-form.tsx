"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb, CheckSquare, UserCircle2 } from "lucide-react"
import type { User } from "@/lib/types"
import { getUserLevel } from "@/lib/point-system"

interface NewPostFormProps {
  onSubmit: (data: { title: string; content: string; type: "idea" | "task"; assignedTo?: string; pointValue?: number }) => void
  onCancel: () => void
  users: User[]
}

interface BountyType {
  type: 'bitcoin' | 'reward' | 'revenue_share' | 'other'
  value: string
  description: string
}

export function NewPostForm({ onSubmit, onCancel, users }: NewPostFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"idea" | "task">("idea")
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [pointValue, setPointValue] = useState<number>(10)
  const [bounty, setBounty] = useState<BountyType | null>(null)
  const [showBountyForm, setShowBountyForm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      type,
      title,
      content,
      assignedTo,
      pointValue: Number(pointValue),
      bounty: bounty
    })
    setTitle("")
    setContent("")
    setAssignedTo("unassigned")
    setPointValue(10)
    setBounty(null)
    setShowBountyForm(false)
    onCancel()
  }

  return (
    <Card className="border-0 bg-muted/50 max-h-[80vh] overflow-auto">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <RadioGroup
              defaultValue="idea"
              className="flex gap-4"
              onValueChange={(value) => setType(value as "idea" | "task")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="idea" id="idea" />
                <Label htmlFor="idea" className="flex items-center gap-1 cursor-pointer">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  Idea
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="task" id="task" />
                <Label htmlFor="task" className="flex items-center gap-1 cursor-pointer">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  Task
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-background border-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Describe your idea or task..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 bg-background border-0 resize-none"
              required
            />
          </div>

          {type === "task" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign to</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="bg-background border-0">
                    <SelectValue placeholder="Select a user to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anyone">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-4 w-4 text-primary" />
                        <span>Anyone</span>
                        <span className="text-xs text-muted-foreground ml-1">(Open for all)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <UserCircle2 className="h-4 w-4 text-primary" />
                          {user.name}
                          {user.streak && user.streak > 0 && <span className="text-xs">🔥 {user.streak}</span>}
                          {user.points && (
                            <span className="text-xs text-primary ml-auto">Lvl {getUserLevel(user.points).level}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Point Value</Label>
                <Input
                  type="number"
                  min="1"
                  value={pointValue}
                  onChange={(e) => setPointValue(Number(e.target.value))}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Bounty (Optional)</Label>
                  {!bounty && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBountyForm(true)}
                    >
                      Add Bounty
                    </Button>
                  )}
                </div>

                {(showBountyForm || bounty) && (
                  <div className="space-y-3 border rounded-lg p-3">
                    <Select
                      value={bounty?.type}
                      onValueChange={(value) => setBounty({ ...bounty, type: value } as BountyType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bounty type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                        <SelectItem value="reward">Reward (e.g., Golf Trip)</SelectItem>
                        <SelectItem value="revenue_share">Revenue Share</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value (e.g., 0.1 BTC, 5% revenue)"
                      value={bounty?.value || ''}
                      onChange={(e) => setBounty({ ...bounty, value: e.target.value } as BountyType)}
                    />

                    <Textarea
                      placeholder="Description of the bounty..."
                      value={bounty?.description || ''}
                      onChange={(e) => setBounty({ ...bounty, description: e.target.value } as BountyType)}
                    />

                    {bounty && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setBounty(null)
                          setShowBountyForm(false)
                        }}
                      >
                        Remove Bounty
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-2 p-4 pt-0 sticky bottom-0 bg-muted/50">
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-full">
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || !content.trim()} className="rounded-full">
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
