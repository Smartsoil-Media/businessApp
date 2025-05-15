"use client"

import { useEffect, useState } from "react"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { ThreadView } from "@/components/thread-view"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { confetti } from "@/lib/confetti"
import { PointsPopup } from "@/components/points-popup"
import { Leaderboard } from "@/components/leaderboard"
import { MilestonesView } from "@/components/milestones-view"
import { UserStatsCard } from "@/components/user-stats-card"
import { PointsHistory } from "@/components/points-history"
import { POINT_VALUES, isSameWeek } from "@/lib/point-system"
import type { Thread, Post, User, PointsActivity, Challenge } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"
import { collection, onSnapshot, query, doc, setDoc, serverTimestamp, updateDoc, deleteDoc, arrayUnion, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DbThread } from "@/lib/db-types"
import { initializeDefaultThreads } from "@/lib/default-threads"
import { useAuth } from "@/lib/auth-context"
import { completionMessages } from "@/lib/completion-messages"


// Sample active challenges
const activeChallenges: Challenge[] = [
  {
    id: "challenge1",
    title: "Collaboration Champion",
    description: "Reply to at least 5 posts this week",
    pointsReward: 50,
    isActive: true,
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).getTime(),
  },
  {
    id: "challenge2",
    title: "Idea Innovator",
    description: "Share 3 new ideas this week",
    pointsReward: 75,
    isActive: true,
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).getTime(),
  },
  {
    id: "challenge3",
    title: "Task Terminator",
    description: "Complete 10 tasks before the end of the month",
    pointsReward: 100,
    isActive: true,
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).getTime(),
  },
]




// Fun task completion messages
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

export function AppShell() {
  const [threads, setThreads] = useState<DbThread[]>([])
  const [loading, setLoading] = useState(true)
  const [activeThreadId, setActiveThreadId] = useState("home")
  const [users, setUsers] = useState<User[]>([])
  const [achievements, setAchievements] = useState<string[]>([])
  const [taskCompletionCount, setTaskCompletionCount] = useState(0)
  const [pointsPopup, setPointsPopup] = useState<{ points: number; message: string } | null>(null)
  const [challenges] = useState<Challenge[]>(activeChallenges)
  const { toast } = useToast()
  const { userProfile, setUserProfile } = useAuth()

  useEffect(() => {
    // Initialize default threads if needed
    initializeDefaultThreads()

    // Subscribe to threads collection
    const unsubscribe = onSnapshot(
      query(collection(db, 'threads')),
      (snapshot) => {
        const threads = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as DbThread[]
        setThreads(threads)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!userProfile?.id) return

    // Subscribe to user document changes
    const unsubscribe = onSnapshot(
      doc(db, 'users', userProfile.id),
      (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as DbUser)
        }
      }
    )

    return () => unsubscribe()
  }, [userProfile?.id])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[]
      setUsers(userData)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  const activeThread = threads.find((t) => t.id === activeThreadId)
  if (!activeThread) {
    return <div>Thread not found</div>
  }

  let allPosts: (DbPost & { threadName?: string })[] = []

  if (activeThread.isHome) {
    // Get completion posts from home thread
    const homePosts = activeThread.posts || []

    // Get posts from all other threads
    const otherThreadsPosts = threads
      .filter(thread => !thread.isHome)
      .flatMap(thread =>
        thread.posts?.map(post => ({
          ...post,
          threadName: thread.name,
        })) || []
      )

    // Combine and sort all posts
    allPosts = [...homePosts, ...otherThreadsPosts]
      .sort((a, b) => b.timestamp - a.timestamp)
  } else {
    // Regular thread - just show its posts
    allPosts = (activeThread.posts || [])
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  // Create a new thread
  const createThread = async (name: string, description: string) => {
    try {
      const threadRef = doc(collection(db, 'threads'))
      const newThread: DbThread = {
        id: threadRef.id,
        name,
        description,
        isHome: false,
        isTaskThread: false,
        createdAt: serverTimestamp(),
        createdBy: userProfile.id,
        posts: []
      }

      await setDoc(threadRef, newThread)
      toast({
        title: "Thread created",
        description: `Successfully created #${name}`,
      })
    } catch (error) {
      console.error('Error creating thread:', error)
      toast({
        title: "Error",
        description: "Failed to create thread",
        variant: "destructive",
      })
    }
  }

  // Edit an existing thread
  const editThread = async (threadId: string, name: string, description: string) => {
    try {
      const threadRef = doc(db, 'threads', threadId)
      await updateDoc(threadRef, {
        name,
        description,
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Thread Updated",
        description: `#${name} has been updated successfully.`,
      })
    } catch (error) {
      console.error('Error updating thread:', error)
      toast({
        title: "Error",
        description: "Failed to update thread",
        variant: "destructive",
      })
    }
  }

  // Delete a thread
  const deleteThread = async (threadId: string) => {
    try {
      const threadRef = doc(db, 'threads', threadId)
      await deleteDoc(threadRef)

      // Navigate to home thread if the deleted thread was active
      if (activeThreadId === threadId) {
        setActiveThreadId('home')
      }

      toast({
        title: "Thread Deleted",
        description: "Thread has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting thread:', error)
      toast({
        title: "Error",
        description: "Failed to delete thread",
        variant: "destructive",
      })
    }
  }

  // Award points to a user for an activity
  const awardPoints = async (
    userId: string,
    activityType: PointsActivity["type"],
    points: number,
    description: string,
    relatedId?: string,
  ) => {
    const activity: PointsActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type: activityType,
      points,
      description,
      timestamp: Date.now(),
      relatedId,
    }

    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userRef, {
          id: userId,
          points: points,
          weeklyPoints: points,
          streak: 1,
          pointsHistory: [activity],
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        })
      } else {
        const userData = userDoc.data()
        const lastActiveDate = new Date(userData.lastActive)
        const currentDate = new Date()
        const isConsecutiveDay = (currentDate.getTime() - lastActiveDate.getTime()) === 86400000 // 1 day in ms

        const newStreak = isConsecutiveDay ? (userData.streak || 0) + 1 : 1

        await updateDoc(userRef, {
          points: (userData.points || 0) + points,
          weeklyPoints: isSameWeek(currentDate, new Date(activity.timestamp))
            ? (userData.weeklyPoints || 0) + points
            : points,
          streak: newStreak,
          pointsHistory: arrayUnion(activity),
          lastActive: serverTimestamp()
        })
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === userId) {
            const pointsHistory = [...(user.pointsHistory || []), activity]
            const isCurrentWeek = isSameWeek(new Date(), new Date(activity.timestamp))

            const lastActiveDate = new Date(user.lastActive || 0)
            const currentDate = new Date()
            const isConsecutiveDay = (currentDate.getTime() - lastActiveDate.getTime()) === 86400000 // 1 day in ms

            return {
              ...user,
              points: (user.points || 0) + points,
              weeklyPoints: isCurrentWeek ? (user.weeklyPoints || 0) + points : points,
              streak: isConsecutiveDay ? (user.streak || 0) + 1 : 1,
              pointsHistory,
              lastActive: Date.now(),
            }
          }
          return user
        }),
      )

      // If this is the current user, show a points popup
      if (userId === userProfile?.id) {
        setPointsPopup({ points, message: description })
      }
    } catch (error) {
      console.error('Error updating user points:', error)
      toast({
        title: "Error",
        description: "Failed to update points",
        variant: "destructive",
      })
    }
  }

  // Add a new post to a thread
  const addPost = async (threadId: string, data: any) => {
    try {
      const thread = threads.find(t => t.id === threadId)
      if (!thread) return

      const post = {
        id: `post-${Date.now()}`,
        threadId,
        type: data.type,
        title: data.title,
        content: data.content,
        author: userProfile?.id || 'anonymous',
        timestamp: Date.now(),
        replies: [],
        assignedTo: data.assignedTo,
        pointValue: data.pointValue,
        bounty: data.bounty,
        threadName: thread.name,
        isCompleted: false
      }

      // Update the thread with the new post
      const threadRef = doc(db, 'threads', threadId)
      await updateDoc(threadRef, {
        posts: [...thread.posts, post]
      })

      toast({
        title: "Post created",
        description: "Your post has been added successfully.",
      })
    } catch (error) {
      console.error('Error adding post:', error)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    }
  }

  // Add a reply to a post
  const addReply = async (threadId: string, postId: string, content: string, author: string) => {
    try {
      const threadRef = doc(db, 'threads', threadId)
      const thread = threads.find(t => t.id === threadId)

      if (!thread) return

      const post = thread.posts.find(p => p.id === postId)
      if (!post) return

      const replyId = `reply-${Date.now()}`
      const newReply = {
        id: replyId,
        content,
        author,
        createdAt: serverTimestamp()
      }

      const updatedPosts = thread.posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            replies: [...(p.replies || []), newReply]
          }
        }
        return p
      })

      await updateDoc(threadRef, {
        posts: updatedPosts
      })

      toast({
        title: "Reply added",
        description: "Your reply has been added successfully.",
      })
    } catch (error) {
      console.error('Error adding reply:', error)
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      })
    }
  }

  // Assign a task to a user
  const assignTask = (threadId: string, postId: string, userId: string) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            posts: thread.posts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  assignedTo: userId,
                }
              }
              return post
            }),
          }
        }
        return thread
      }),
    )

    // Award points for task assignment
    awardPoints(userId, "task_assigned", POINT_VALUES.TASK_ASSIGNED, "Task assigned to you", postId)
  }

  // Toggle task completion status
  const toggleTaskCompletion = async (threadId: string, postId: string) => {
    try {
      const threadRef = doc(db, 'threads', threadId)
      const homeThreadRef = doc(db, 'threads', 'home')
      const thread = threads.find(t => t.id === threadId)
      if (!thread) return

      const post = thread.posts.find(p => p.id === postId)
      if (!post) return

      const wasCompleted = !!post.isCompleted
      const newlyCompleted = !wasCompleted
      const assignedToUser = userProfile?.id
      const taskTitle = post.title
      const pointValue = post.pointValue || POINT_VALUES.TASK_COMPLETE

      // Update task completion status
      const updatedPosts = thread.posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isCompleted: !p.isCompleted,
          }
        }
        return p
      })

      // Update task thread
      await updateDoc(threadRef, {
        posts: updatedPosts
      })

      // Create completion post in home thread if task is being completed
      if (newlyCompleted && assignedToUser) {
        // Get current home thread data
        const homeThreadDoc = await getDoc(homeThreadRef)
        const homeThread = homeThreadDoc.data()

        const completionPost = {
          id: `completion-${Date.now()}`,
          threadId: 'home',
          type: 'completion',
          title: `Task Completed: ${taskTitle}`,
          content: `${users.find(u => u.id === assignedToUser)?.name || 'Anonymous'} completed "${taskTitle}" and earned ${pointValue} points!`,
          author: assignedToUser,
          timestamp: Date.now(),
          replies: [],
          isCompletionPost: true,
          isTaskCompletion: true,
          taskId: postId,
          completedThreadName: thread.name
        }

        // Add these console logs
        console.log('Creating completion post with:', {
          assignedToUser,
          users,
          foundUser: users.find(u => u.id === assignedToUser),
          allUserIds: users.map(u => u.id)
        })

        // If home thread doesn't exist or doesn't have posts, initialize it
        if (!homeThread) {
          await setDoc(homeThreadRef, {
            id: 'home',
            name: 'Home',
            description: 'All posts from all threads',
            isHome: true,
            createdAt: serverTimestamp(),
            createdBy: 'system',
            posts: [completionPost]
          })
        } else {
          // Add completion post to existing posts array
          const currentPosts = homeThread.posts || []
          await updateDoc(homeThreadRef, {
            posts: [...currentPosts, completionPost]
          })
        }

        // Award points and show completion message
        await awardPoints(
          assignedToUser,
          "task_completed",
          pointValue,
          `Completed task: ${taskTitle}`,
          postId
        )

        const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)]
        setPointsPopup({
          points: pointValue,
          message: randomMessage
        })
      }
    } catch (error) {
      console.error('Error in toggleTaskCompletion:', error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  // Handle logout (placeholder)
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      duration: 3000,
    })
  }

  // Get all thread names for validation
  const allThreadNames = threads.map((thread) => thread.name)

  const handlePointsPopupComplete = () => {
    setPointsPopup(null)
  }

  const handleReaction = async (threadId: string, postId: string, emoji: string) => {
    try {
      const thread = threads.find(t => t.id === threadId)
      if (!thread) return

      const post = thread.posts.find(p => p.id === postId)
      if (!post) return

      const userId = userProfile?.id
      if (!userId) return

      // Initialize reactions if they don't exist
      const reactions = post.reactions || {}
      const reaction = reactions[emoji] || { emoji, users: [] }

      // Toggle user's reaction
      const hasReacted = reaction.users.includes(userId)
      const updatedUsers = hasReacted
        ? reaction.users.filter(id => id !== userId)
        : [...reaction.users, userId]

      // Update post with new reaction data
      const threadRef = doc(db, 'threads', threadId)
      const updatedPosts = thread.posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            reactions: {
              ...reactions,
              [emoji]: { emoji, users: updatedUsers }
            }
          }
        }
        return p
      })

      await updateDoc(threadRef, { posts: updatedPosts })
    } catch (error) {
      console.error('Error updating reaction:', error)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onThreadSelect={setActiveThreadId}
          onCreateThread={createThread}
          users={users}
          currentUser={userProfile}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-hidden">
          {activeThread.id === "leaderboard" ? (
            <Leaderboard users={users} />
          ) : activeThread.id === "milestones" ? (
            <MilestonesView challenges={challenges} users={users} />
          ) : (
            <ThreadView
              thread={activeThread}
              posts={allPosts}
              users={users}
              userProfile={userProfile}
              onAddPost={addPost}
              onAddReply={addReply}
              onAssignTask={assignTask}
              onToggleTaskCompletion={toggleTaskCompletion}
              onEditThread={editThread}
              onDeleteThread={deleteThread}
              onReact={handleReaction}
              existingThreadNames={allThreadNames}
            />
          )}
        </main>
      </div>
      <Toaster />
      {pointsPopup && (
        <PointsPopup
          points={pointsPopup.points}
          message={pointsPopup.message}
          onComplete={handlePointsPopupComplete}
        />
      )}
    </SidebarProvider>
  )
}
