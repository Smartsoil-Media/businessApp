import { Timestamp } from 'firebase/firestore'

export interface DbUser {
    id: string
    email: string
    name: string
    avatar?: string
    streak: number
    points: number
    weeklyPoints: number
    createdAt: Timestamp
    pointsHistory: PointActivity[]
}

export interface PointActivity {
    id: string
    userId: string
    type: 'task_complete' | 'idea_shared' | 'streak_bonus' | 'reply_added' | 'task_assigned'
    points: number
    description: string
    timestamp: number
}

export interface DbThread {
    id: string
    name: string
    description: string
    isHome?: boolean
    isTaskThread?: boolean
    createdAt: Timestamp
    createdBy: string
    posts: DbPost[]
}

export interface DbPost {
    id: string
    content: string
    userId: string
    threadId: string
    createdAt: Timestamp
    replies: DbReply[]
    isTaskCompletion?: boolean
    taskId?: string
}

export interface DbReply {
    id: string
    content: string
    userId: string
    postId: string
    createdAt: Timestamp
} 