"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Lightbulb, CheckSquare, UserCircle2, MoreHorizontal, Trophy } from "lucide-react"
import type { Post, User } from "@/lib/types"
import { formatTimeAgo } from "@/lib/utils"
import { getUserLevel } from "@/lib/point-system"
import confetti from 'canvas-confetti'
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface PostCardProps {
  post: Post & { threadName?: string; completedThreadName?: string; isCompletionPost?: boolean }
  users: User[]
  userProfile?: User
  showThreadName?: boolean
  onAddReply: (content: string) => void
  onAssignTask: (userId: string) => void
  onToggleTaskCompletion: (threadId: string, postId: string) => void
  onReact: (emoji: string) => void
}

const completionMessages = [
  "Soil-idly done! 🌱",
  "You're on fire! 🔥 (in a good, non-soil-burning way)",
  "Another one bites the dust! 🌪️",
  "Task crushed like a soil compactor! 💪",
  "You're growing the business! 🌿",
  "That's how it's done! 👏",
  "Smartsoil gets smarter thanks to you! 🧠",
  "Cultivating success, one task at a time! 🌾",
]

export function PostCard({
  post,
  users,
  userProfile,
  showThreadName = false,
  onAddReply,
  onAssignTask,
  onToggleTaskCompletion,
  onReact,
}: PostCardProps) {
  const { toast } = useToast()
  const [replyContent, setReplyContent] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [showAssign, setShowAssign] = useState(false)

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onAddReply(replyContent)
      setReplyContent("")
      setIsReplying(false)
    }
  }

  const assignedUser = post.assignedTo ? users.find((user) => user.id === post.assignedTo) : null

  // Get user level data if assigned
  const userLevel = assignedUser?.points ? getUserLevel(assignedUser.points) : null

  // Check if this is an achievement post
  const isAchievement = post.threadId === "achievements"

  const handleTaskCompletion = () => {
    if (!post.isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#10B981', '#059669', '#047857']
      })
    }
    onToggleTaskCompletion(post.threadId, post.id)
  }

  return (
    <Card>
      <CardHeader className="relative p-4">
        {/* Author header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {users.find(u => u.id === post.author)?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {users.find(u => u.id === post.author)?.name || 'Anonymous'}
                </span>
                {showThreadName && post.threadName && (
                  <Badge variant="outline" className="text-xs">#{post.threadName}</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(post.timestamp)}
              </span>
            </div>
          </div>
          {post.pointValue && (
            <Badge className="bg-primary/10 text-primary">
              {post.pointValue} pts
            </Badge>
          )}
        </div>

        {/* Post content based on type */}
        <div className="pl-11">
          <h3 className="font-semibold mb-2">{post.title}</h3>
          <p className="text-sm text-muted-foreground">{post.content}</p>
          {post.type === "task" && (
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex items-center gap-2">
                {post.assignedTo && (
                  <span className="text-sm text-muted-foreground">
                    Assigned to: {users.find(u => u.id === post.assignedTo)?.name || 'Anyone'}
                  </span>
                )}
                {post.bounty && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500/10 text-yellow-500 gap-2">
                      <Trophy className="h-3 w-3" />
                      Bounty: {post.bounty.value}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {post.bounty.description}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!post.isCompleted ? (
                  <Button
                    onClick={handleTaskCompletion}
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    disabled={post.assignedTo !== 'anyone' && post.assignedTo !== userProfile?.id}
                  >
                    <CheckSquare className="h-4 w-4" />
                    Mark as complete
                  </Button>
                ) : (
                  <Badge variant="success" className="gap-2">
                    <CheckSquare className="h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Reactions */}
      <div className="flex justify-end items-center gap-1 mt-2">
        <div className="bg-secondary/20 rounded-lg p-0.5 flex">
          {['🚀', '🔥', '🤑'].map((emoji, index) => {
            const reactionCount = post.reactions?.[emoji]?.users.length || 0
            const hasReacted = post.reactions?.[emoji]?.users.includes(userProfile?.id || '')

            return (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={`
                  px-2 py-1 h-7 rounded-md
                  ${hasReacted ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'}
                  ${index !== 0 ? 'border-l border-secondary/30' : ''}
                `}
                onClick={() => onReact(emoji)}
              >
                <span className="text-sm">{emoji}</span>
                {reactionCount > 0 && (
                  <span className="text-xs ml-1 font-medium">
                    {reactionCount}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Only show actions for non-completion posts */}
      {post.type !== "completion" && (
        <CardContent className="border-t bg-muted/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setIsReplying(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Reply
            </Button>
            {post.type === "task" && !post.isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setShowAssign(true)}
              >
                <UserCircle2 className="h-4 w-4 mr-1" />
                Assign
              </Button>
            )}
          </div>
        </CardContent>
      )}

      {post.replies.length > 0 && !isAchievement && (
        <div className="pl-12 mt-3 space-y-3 border-l border-border/50">
          {post.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3 relative">
              <Avatar className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 text-primary">
                <AvatarFallback className="text-xs">
                  {users.find(u => u.id === reply.author)?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {users.find(u => u.id === reply.author)?.name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(reply.timestamp)}</span>
                </div>
                <p className="mt-1">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isReplying && !isAchievement && (
        <div className="mt-3 pl-12 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-24 w-full bg-muted border-0 resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitReply} disabled={!replyContent.trim()}>
              Reply
            </Button>
          </div>
        </div>
      )}

      {showAssign && !isAchievement && (
        <div className="mt-3 pl-12 space-y-2">
          <Select
            onValueChange={(value) => {
              onAssignTask(value)
              setShowAssign(false)
            }}
          >
            <SelectTrigger className="bg-muted border-0">
              <SelectValue placeholder="Select a user to assign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anyone">
                <div className="flex items-center gap-2">
                  <span>Anyone</span>
                  <span className="text-xs text-muted-foreground ml-1">(Open for all)</span>
                </div>
              </SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
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
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAssign(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
