"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Timer, Users, DollarSign, Zap, Flag, Target, TrendingUp, Plus, Lightbulb } from "lucide-react"
import type { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Define types for milestones
interface Milestone {
  id: string
  title: string
  description: string
  type: "user" | "financial" | "product" | "other"
  targetValue: number
  currentValue: number
  shortTerm: boolean
  dueDate?: string
  createdBy: string
  ideas: MilestoneIdea[]
}

interface MilestoneIdea {
  id: string
  content: string
  author: string
  timestamp: number
  authorId: string
}

interface MilestonesViewProps {
  users: User[]
  currentUser: User
}

export function MilestonesView({ users, currentUser }: MilestonesViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "short" | "long">("all")
  const [showNewIdeaDialog, setShowNewIdeaDialog] = useState(false)
  const [showNewMilestoneDialog, setShowNewMilestoneDialog] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [newIdea, setNewIdea] = useState("")
  const [showUpdateProgressDialog, setShowUpdateProgressDialog] = useState(false)
  const [newProgressValue, setNewProgressValue] = useState<number>(0)

  const { toast } = useToast()
  const router = useRouter()

  // Sample milestones data
  const [milestones, setMilestones] = useState<Milestone[]>([



    {
      id: "m7",
      title: "A sample milstone",
      description: "Release the first version of our soil analysis API",
      type: "product",
      targetValue: 100,
      currentValue: 70,
      shortTerm: true,
      dueDate: "2024-05-15",
      createdBy: "Robin Gupta",
      ideas: [
        {
          id: "i6",
          content: "Create detailed API documentation with usage examples",
          author: "Taylor Kim",
          timestamp: Date.now() - 86400000 * 6,
          authorId: "user7",
        },
      ],
    },
  ])

  // Filter milestones based on the active tab
  const filteredMilestones = milestones.filter((milestone) => {
    if (activeTab === "all") return true
    if (activeTab === "short") return milestone.shortTerm
    if (activeTab === "long") return !milestone.shortTerm
    return true
  })

  // Function to add a new idea to a milestone
  const addIdeaToMilestone = () => {
    if (!selectedMilestone || !newIdea.trim()) return

    const idea: MilestoneIdea = {
      id: `i${Date.now()}`,
      content: newIdea.trim(),
      author: currentUser.name,
      timestamp: Date.now(),
      authorId: currentUser.id,
    }

    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === selectedMilestone.id) {
          return {
            ...m,
            ideas: [...m.ideas, idea],
          }
        }
        return m
      }),
    )

    setNewIdea("")
    setShowNewIdeaDialog(false)
  }

  // Function to update milestone progress
  const updateMilestoneProgress = () => {
    if (!selectedMilestone || newProgressValue === undefined) return

    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === selectedMilestone.id) {
          return {
            ...m,
            currentValue: newProgressValue,
          }
        }
        return m
      }),
    )

    toast({
      title: "Progress Updated",
      description: `${selectedMilestone.title} progress has been updated.`,
      duration: 3000,
    })

    setShowUpdateProgressDialog(false)
  }

  // Get the icon for a milestone type
  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-5 w-5" />
      case "financial":
        return <DollarSign className="h-5 w-5" />
      case "product":
        return <Zap className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  // Get the color for a milestone type
  const getMilestoneColor = (type: string) => {
    switch (type) {
      case "user":
        return "text-blue-400 bg-blue-400/10"
      case "financial":
        return "text-green-400 bg-green-400/10"
      case "product":
        return "text-purple-400 bg-purple-400/10"
      default:
        return "text-orange-400 bg-orange-400/10"
    }
  }

  // Format a number with commas and abbreviations for large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="thread-header flex items-center justify-between p-4 pl-16 md:pl-4">
        <div>
          <h2 className="text-xl font-semibold">#Milestones</h2>
          <p className="text-sm text-muted-foreground">Track company goals and progress</p>
        </div>
        <Button onClick={() => setShowNewMilestoneDialog(true)} className="rounded-full gap-1">
          <Plus className="h-4 w-4" /> New Milestone
        </Button>
      </div>

      <div className="p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "short" | "long")}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="all">All Milestones</TabsTrigger>
              <TabsTrigger value="short">Short-term</TabsTrigger>
              <TabsTrigger value="long">Long-term</TabsTrigger>
            </TabsList>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMilestones.map((milestone) => {
              const progressPercentage = Math.min(
                100,
                Math.round((milestone.currentValue / milestone.targetValue) * 100),
              )
              const iconColorClass = getMilestoneColor(milestone.type)

              return (
                <Card key={milestone.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-full ${iconColorClass}`}>{getMilestoneIcon(milestone.type)}</div>
                      <Badge variant={milestone.shortTerm ? "default" : "secondary"}>
                        {milestone.shortTerm ? "Short-term" : "Long-term"}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{milestone.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {formatNumber(milestone.currentValue)} / {formatNumber(milestone.targetValue)}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="text-xs text-right text-muted-foreground">{progressPercentage}% complete</div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Timer className="h-4 w-4 mr-1" />
                        <span>
                          {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : "No deadline"}
                        </span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>
                          {milestone.ideas.length} idea{milestone.ideas.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {milestone.ideas.length > 0 && (
                      <div className="pt-2">
                        <Separator className="mb-2" />
                        <div className="text-sm font-medium mb-2">Latest idea:</div>
                        <div className="bg-muted/50 p-2 rounded-md text-sm">
                          {milestone.ideas[milestone.ideas.length - 1].content}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setSelectedMilestone(milestone)
                        setNewProgressValue(milestone.currentValue)
                        setShowUpdateProgressDialog(true)
                      }}
                    >
                      <TrendingUp className="h-4 w-4" />
                      Update
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setSelectedMilestone(milestone)
                        setShowNewIdeaDialog(true)
                      }}
                    >
                      <Lightbulb className="h-4 w-4" />
                      Add Idea
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </Tabs>

        {/* Dialog for adding a new idea to a milestone */}
        <Dialog open={showNewIdeaDialog} onOpenChange={setShowNewIdeaDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Add Idea for {selectedMilestone?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idea">Your Idea</Label>
                  <Textarea
                    id="idea"
                    placeholder="Share your idea on how to achieve this milestone..."
                    rows={4}
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                  />
                </div>

                {selectedMilestone && selectedMilestone.ideas.length > 0 && (
                  <div className="space-y-2">
                    <Label>Existing Ideas</Label>
                    <ScrollArea className="h-32 rounded-md border">
                      <div className="p-4 space-y-2">
                        {selectedMilestone.ideas.map((idea, index) => {
                          const author = users.find((u) => u.id === idea.authorId) || {
                            name: idea.author,
                            avatar: undefined,
                          }

                          return (
                            <div
                              key={idea.id}
                              className="flex gap-2 pb-2 border-b border-border/50 last:border-0 last:pb-0"
                            >
                              <Avatar className="h-6 w-6">
                                {author.avatar ? (
                                  <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
                                ) : (
                                  <AvatarFallback className="text-xs">
                                    {author.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1">
                                <div className="text-sm">{idea.content}</div>
                                <div className="text-xs text-muted-foreground flex gap-1">
                                  <span>{idea.author}</span>
                                  <span>•</span>
                                  <span>{new Date(idea.timestamp).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowNewIdeaDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addIdeaToMilestone} disabled={!newIdea.trim()}>
                Submit Idea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog for updating milestone progress */}
        <Dialog open={showUpdateProgressDialog} onOpenChange={setShowUpdateProgressDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Update Progress for {selectedMilestone?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentProgress">Current Progress</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="currentProgress"
                      type="number"
                      min={0}
                      max={selectedMilestone?.targetValue || 100}
                      value={newProgressValue}
                      onChange={(e) => setNewProgressValue(Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">/ {selectedMilestone?.targetValue || 0}</span>
                  </div>
                </div>

                {selectedMilestone && (
                  <div className="space-y-2">
                    <Label>Progress Preview</Label>
                    <div className="space-y-1">
                      <Progress
                        value={Math.min(
                          100,
                          Math.round((newProgressValue / (selectedMilestone.targetValue || 1)) * 100),
                        )}
                        className="h-2"
                      />
                      <div className="text-xs text-right text-muted-foreground">
                        {Math.min(100, Math.round((newProgressValue / (selectedMilestone.targetValue || 1)) * 100))}%
                        complete
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowUpdateProgressDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateMilestoneProgress}>Update Progress</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog for creating a new milestone (placeholder) */}
        <Dialog open={showNewMilestoneDialog} onOpenChange={setShowNewMilestoneDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Create New Milestone
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="py-4 px-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="e.g., Reach 1,000 active users" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe this milestone and why it's important..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="user">User Growth</option>
                        <option value="financial">Financial</option>
                        <option value="product">Product</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="term">Term</Label>
                      <select
                        id="term"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="short">Short-term</option>
                        <option value="long">Long-term</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target">Target Value</Label>
                      <Input id="target" type="number" placeholder="e.g., 1000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current">Current Value</Label>
                      <Input id="current" type="number" placeholder="e.g., 250" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date (optional)</Label>
                    <Input id="dueDate" type="date" />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowNewMilestoneDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowNewMilestoneDialog(false)}>Create Milestone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
