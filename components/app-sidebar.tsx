"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/components/sidebar-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, Plus, Hash, Home, CheckSquare, X, Crown, Medal, LogOut, User, Flag } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { CreateThreadDialog } from "@/components/create-thread-dialog"
import type { Thread, User as UserType } from "@/lib/types"
import { getUserLevel, getLevelProgress } from "@/lib/point-system"
import { useAuth } from "@/lib/auth-context"

interface AppSidebarProps {
  threads: Thread[]
  activeThreadId: string
  onThreadSelect: (threadId: string) => void
  onCreateThread: (name: string, description: string) => void
  users: UserType[]
  currentUser: UserType
  onLogout?: () => void
}

interface ThreadButtonProps {
  thread: Thread
  isActive: boolean
  onClick: () => void
}

function ThreadButton({ thread, isActive, onClick }: ThreadButtonProps) {
  return (
    <Button
      variant="ghost"
      className={`sidebar-item w-full justify-start font-normal ${isActive ? "sidebar-item-active" : ""
        }`}
      onClick={onClick}
    >
      {thread.isHome ? (
        <Home className="h-4 w-4" />
      ) : thread.isTaskThread ? (
        <CheckSquare className="h-4 w-4" />
      ) : thread.id === "milestones" ? (
        <Flag className="h-4 w-4 text-green-400" />
      ) : thread.id === "leaderboard" ? (
        <Crown className="h-4 w-4 text-yellow-400" />
      ) : (
        <Hash className="h-4 w-4" />
      )}
      {thread.name}
      {thread.isHome && (
        <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
          All
        </span>
      )}
      {thread.isTaskThread && (
        <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
          Tasks
        </span>
      )}
    </Button>
  )
}

export function AppSidebar({
  threads,
  activeThreadId,
  onThreadSelect,
  onCreateThread,
  users,
  currentUser,
  onLogout,
}: AppSidebarProps) {
  const router = useRouter()
  const { open, setOpen, isMobile } = useSidebar()
  const [showCreateThreadDialog, setShowCreateThreadDialog] = useState(false)
  const { signOut } = useAuth()

  // Get user level information
  const { level, title, nextLevel } = getUserLevel(currentUser.points || 0)
  const levelProgress = getLevelProgress(currentUser.points || 0)

  // Get existing thread names for validation
  const existingThreadNames = threads.map((thread) => thread.name)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
      if (isMobile) {
        setOpen(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigateToProfile = () => {
    router.push("/profile")
    if (isMobile) {
      setOpen(false)
    }
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary" />
          <h1 className="text-lg font-semibold">Smartsoil</h1>
        </div>
      </div>

      {/* User profile section */}
      <div className="px-4 py-2">
        <div
          className="flex flex-col p-3 rounded-lg bg-accent/50 cursor-pointer hover:bg-accent transition-colors"
          onClick={navigateToProfile}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              {currentUser?.avatar ? (
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name || ''} />
              ) : (
                <AvatarFallback>
                  {currentUser?.name
                    ? currentUser.name.split(" ").map((n) => n[0]).join("")
                    : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="font-medium flex items-center gap-1">
                {currentUser.name}
                <User className="h-3 w-3 ml-1 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="inline-flex items-center">🔥 {currentUser.streak || 0} day streak</span>
              </div>
            </div>
          </div>

          {/* Points and level display */}
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium flex items-center gap-1">
                <Medal className="h-3 w-3 text-primary" /> Level {level}
              </span>
              <span className="text-primary font-medium">{currentUser.points || 0} pts</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{title}</span>
                {nextLevel && <span>{nextLevel.title}</span>}
              </div>

              <Progress value={levelProgress} className="h-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable thread list - with flex-1 to take available space */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {/* Fixed position threads */}
          {threads
            .filter(thread => thread.isHome)
            .map((thread) => (
              <ThreadButton
                key={thread.id}
                thread={thread}
                isActive={activeThreadId === thread.id}
                onClick={() => onThreadSelect(thread.id)}
              />
            ))}

          {threads
            .filter(thread => thread.isTaskThread)
            .map((thread) => (
              <ThreadButton
                key={thread.id}
                thread={thread}
                isActive={activeThreadId === thread.id}
                onClick={() => onThreadSelect(thread.id)}
              />
            ))}

          {/* Regular threads */}
          {threads
            .filter(thread => !thread.isHome && !thread.isTaskThread && thread.id !== "milestones" && thread.id !== "leaderboard")
            .map((thread) => (
              <ThreadButton
                key={thread.id}
                thread={thread}
                isActive={activeThreadId === thread.id}
                onClick={() => onThreadSelect(thread.id)}
              />
            ))}

          {/* Fixed bottom threads */}
          {threads
            .filter(thread => thread.id === "milestones" || thread.id === "leaderboard")
            .map((thread) => (
              <ThreadButton
                key={thread.id}
                thread={thread}
                isActive={activeThreadId === thread.id}
                onClick={() => onThreadSelect(thread.id)}
              />
            ))}
        </div>
        <Separator className="my-2 opacity-30" />
        <Button
          variant="outline"
          className="w-full justify-start gap-2 rounded-full"
          onClick={() => setShowCreateThreadDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Add Thread
        </Button>
      </ScrollArea>

      {/* Logout button - fixed at bottom */}
      <div className="p-4 mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        open={showCreateThreadDialog}
        onOpenChange={setShowCreateThreadDialog}
        onCreateThread={onCreateThread}
        existingThreadNames={existingThreadNames}
      />
    </div>
  )

  // For mobile, render a Sheet component
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-3 z-40 rounded-full md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="p-0 sm:max-w-xs border-r border-border/50 bg-background" hideCloseButton>
            <SheetHeader className="text-left px-4 h-14 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary" />
                <SheetTitle className="text-lg">Smartsoil</SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetHeader>

            {/* User profile section */}
            <div className="px-4 py-2">
              <div
                className="flex flex-col p-3 rounded-lg bg-accent/50 cursor-pointer hover:bg-accent transition-colors"
                onClick={navigateToProfile}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    {currentUser?.avatar ? (
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name || ''} />
                    ) : (
                      <AvatarFallback>
                        {currentUser?.name
                          ? currentUser.name.split(" ").map((n) => n[0]).join("")
                          : "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-1">
                      {currentUser.name}
                      <User className="h-3 w-3 ml-1 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="inline-flex items-center">🔥 {currentUser.streak || 0} day streak</span>
                    </div>
                  </div>
                </div>

                {/* Points and level display */}
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium flex items-center gap-1">
                      <Medal className="h-3 w-3 text-primary" /> Level {level}
                    </span>
                    <span className="text-primary font-medium">{currentUser.points || 0} pts</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{title}</span>
                      {nextLevel && <span>{nextLevel.title}</span>}
                    </div>

                    <Progress value={levelProgress} className="h-1.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Make sure the ScrollArea has a fixed height on mobile */}
            <div className="flex flex-col h-[calc(100vh-14rem)]">
              <ScrollArea className="flex-1 px-2 py-2">
                <div className="space-y-1">
                  {/* Fixed position threads */}
                  {threads
                    .filter(thread => thread.isHome)
                    .map((thread) => (
                      <ThreadButton
                        key={thread.id}
                        thread={thread}
                        isActive={activeThreadId === thread.id}
                        onClick={() => onThreadSelect(thread.id)}
                      />
                    ))}

                  {threads
                    .filter(thread => thread.isTaskThread)
                    .map((thread) => (
                      <ThreadButton
                        key={thread.id}
                        thread={thread}
                        isActive={activeThreadId === thread.id}
                        onClick={() => onThreadSelect(thread.id)}
                      />
                    ))}

                  {/* Regular threads */}
                  {threads
                    .filter(thread => !thread.isHome && !thread.isTaskThread && thread.id !== "milestones" && thread.id !== "leaderboard")
                    .map((thread) => (
                      <ThreadButton
                        key={thread.id}
                        thread={thread}
                        isActive={activeThreadId === thread.id}
                        onClick={() => onThreadSelect(thread.id)}
                      />
                    ))}

                  {/* Fixed bottom threads */}
                  {threads
                    .filter(thread => thread.id === "milestones" || thread.id === "leaderboard")
                    .map((thread) => (
                      <ThreadButton
                        key={thread.id}
                        thread={thread}
                        isActive={activeThreadId === thread.id}
                        onClick={() => onThreadSelect(thread.id)}
                      />
                    ))}
                </div>
                <Separator className="my-2 opacity-30" />
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-full"
                  onClick={() => setShowCreateThreadDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Thread
                </Button>
              </ScrollArea>

              {/* Logout button - fixed at bottom */}
              <div className="p-4 mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Create Thread Dialog */}
            <CreateThreadDialog
              open={showCreateThreadDialog}
              onOpenChange={setShowCreateThreadDialog}
              onCreateThread={onCreateThread}
              existingThreadNames={existingThreadNames}
            />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // For desktop, render a sidebar
  return (
    <div
      className={`${open ? "w-64" : "w-0"
        } relative hidden h-full flex-col border-r border-border/50 bg-background transition-all duration-300 md:flex`}
    >
      {SidebarContent}
    </div>
  )
}
