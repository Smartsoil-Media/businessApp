export interface Reply {
  id: string
  content: string
  author: string
  timestamp: number
}

// Update the Post interface to include the new fields for completion posts
export interface Post {
  id: string
  threadId: string
  type: "idea" | "task" | "completion"
  title: string
  content: string
  author: string
  timestamp: number
  replies: Reply[]
  assignedTo?: string
  isCompleted?: boolean
  originalTaskId?: string
  isCompletionPost?: boolean
  completedThreadName?: string
  bounty?: {
    type: 'bitcoin' | 'reward' | 'revenue_share' | 'other'
    value: string
    description: string
  }
  reactions?: {
    [key: string]: Reaction
  }
}

export interface Thread {
  id: string
  name: string
  description: string
  isHome: boolean
  isTaskThread?: boolean
  posts: Post[]
}

export interface PointsActivity {
  id: string
  userId: string
  type: "task_complete" | "idea_shared" | "reply_added" | "task_assigned" | "streak_bonus" | "challenge_complete"
  points: number
  description: string
  timestamp: number
  relatedId?: string // ID of related task, post, etc.
}

export interface User {
  id: string
  name: string
  avatar?: string
  streak?: number
  points?: number
  weeklyPoints?: number
  pointsHistory?: PointsActivity[]
  lastActive?: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  pointsReward: number
  isActive: boolean
  endDate: number
}

interface Reaction {
  emoji: '🚀' | '🔥' | '🤑'
  users: string[] // Array of user IDs who reacted
}
