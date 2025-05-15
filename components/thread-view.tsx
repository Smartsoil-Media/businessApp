"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/post-card"
import { NewPostForm } from "@/components/new-post-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditThreadDialog } from "@/components/edit-thread-dialog"
import { DeleteThreadDialog } from "@/components/delete-thread-dialog"
import type { Thread, Post, User } from "@/lib/types"
import { Plus, Filter, Hash, MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface ThreadViewProps {
  thread: Thread
  posts: (Post & { threadName?: string })[]
  users: User[]
  onAddPost: (threadId: string, post: Omit<Post, "id" | "timestamp" | "replies">) => void
  onAddReply: (threadId: string, postId: string, content: string, author: string) => void
  onAssignTask: (threadId: string, postId: string, userId: string) => void
  onToggleTaskCompletion: (threadId: string, postId: string) => void
  onEditThread: (threadId: string, name: string, description: string) => void
  onDeleteThread: (threadId: string) => void
  onReact: (threadId: string, postId: string, emoji: string) => void
  existingThreadNames: string[]
  userProfile?: User
}

export function ThreadView({
  thread,
  posts,
  users,
  onAddPost,
  onAddReply,
  onAssignTask,
  onToggleTaskCompletion,
  onEditThread,
  onDeleteThread,
  onReact,
  existingThreadNames,
  userProfile,
}: ThreadViewProps) {
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [taskFilter, setTaskFilter] = useState<"all" | "completed" | "incomplete">(
    thread.isTaskThread ? "incomplete" : "all",
  )
  const [threadFilter, setThreadFilter] = useState<string>("all")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Get unique thread names for the filter dropdown
  const threadNames = thread.isTaskThread
    ? Array.from(new Set(posts.map((post) => post.threadName))).filter(Boolean)
    : []

  // Filter tasks if we're in the tasks thread
  const filteredPosts = thread.isHome
    ? posts.filter(post => post.isCompletionPost || !post.isCompleted)
    : thread.isTaskThread
      ? posts.filter((post) => {
        // Filter by completion status
        const matchesCompletionFilter =
          taskFilter === "all" ||
          (taskFilter === "completed" && post.isCompleted) ||
          (taskFilter === "incomplete" && !post.isCompleted)

        // Filter by thread name
        const matchesThreadFilter = threadFilter === "all" || post.threadName === threadFilter

        // Both filters must match
        return matchesCompletionFilter && matchesThreadFilter
      })
      : posts

  // Check if this is a special thread that shouldn't be editable
  const isSpecialThread =
    thread.isHome || thread.isTaskThread || thread.id === "milestones" || thread.id === "leaderboard"

  // Handle edit thread
  const handleEditThread = (name: string, description: string) => {
    onEditThread(thread.id, name, description)
  }

  // Handle delete thread
  const handleDeleteThread = () => {
    onDeleteThread(thread.id)
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <div className="thread-header flex flex-col sm:flex-row sm:items-center justify-between p-4 pl-16 md:pl-4">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-xl font-semibold">#{thread.name}</h2>
            <p className="text-sm text-muted-foreground">{thread.description}</p>
          </div>

          {/* Thread actions menu - only show for non-special threads */}
          {!isSpecialThread && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Thread actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Thread</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive flex items-center gap-2"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Thread</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          {thread.isTaskThread && (
            <>
              <Select value={threadFilter} onValueChange={setThreadFilter}>
                <SelectTrigger className="bg-muted border-0 filter-select-trigger w-[140px]">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <SelectValue placeholder="Thread" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Threads</SelectItem>
                  {threadNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={taskFilter} onValueChange={(value) => setTaskFilter(value as any)}>
                <SelectTrigger className="bg-muted border-0 filter-select-trigger w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          {!thread.isHome && !thread.isTaskThread && thread.id !== "achievements" && (
            <Button onClick={() => setShowNewPostForm(true)} className="rounded-full gap-1">
              <Plus className="h-4 w-4" /> New Post
            </Button>
          )}
        </div>
      </div>

      {showNewPostForm && !thread.isHome && !thread.isTaskThread && (
        <div className="p-4 border-b border-border/50 max-h-[80vh] overflow-visible">
          <NewPostForm
            users={users}
            onSubmit={(data) => {
              onAddPost(thread.id, {
                ...data,
                author: userProfile?.id || 'anonymous',
                threadId: thread.id,
              })
              setShowNewPostForm(false)
            }}
            onCancel={() => setShowNewPostForm(false)}
          />
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {filteredPosts.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-sm text-muted-foreground">
                  {thread.isHome
                    ? "Posts from all threads will appear here"
                    : thread.isTaskThread
                      ? threadFilter !== "all"
                        ? `No ${taskFilter !== "all" ? taskFilter : ""} tasks in #${threadFilter}`
                        : `No ${taskFilter !== "all" ? taskFilter : ""} tasks found`
                      : "Create a new post to get started"}
                </p>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                users={users}
                userProfile={userProfile}
                showThreadName={thread.isHome || thread.isTaskThread}
                onAddReply={(content) => onAddReply(thread.id, post.id, content, users.find(u => u.id === userProfile?.id)?.name || 'Anonymous')}
                onAssignTask={(userId) => onAssignTask(thread.id, post.id, userId)}
                onToggleTaskCompletion={() => onToggleTaskCompletion(thread.id, post.id)}
                onReact={(emoji) => onReact(thread.id, post.id, emoji)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Edit Thread Dialog */}
      <EditThreadDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        thread={thread}
        onEditThread={handleEditThread}
        existingThreadNames={existingThreadNames}
      />

      {/* Delete Thread Dialog */}
      <DeleteThreadDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        threadName={thread.name}
        onDeleteThread={handleDeleteThread}
      />
    </div>
  )
}
