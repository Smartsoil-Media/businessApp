import { db } from './firebase'
import { collection, getDocs, query, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import type { DbThread } from './db-types'

export const defaultThreads: Partial<DbThread>[] = [
    {
        id: "home",
        name: "Home",
        description: "All posts from all threads",
        isHome: true,
    },
    {
        id: "tasks",
        name: "Tasks",
        description: "Task management and tracking",
        isTaskThread: true,
    },
    {
        id: "milestones",
        name: "Milestones",
        description: "Project milestones and achievements",
    },
    {
        id: "leaderboard",
        name: "Leaderboard",
        description: "User rankings and achievements",
    },
]

export async function initializeDefaultThreads() {
    const threadsRef = collection(db, 'threads')
    const snapshot = await getDocs(query(threadsRef))

    if (snapshot.empty) {
        // Only create default threads if none exist
        for (const thread of defaultThreads) {
            await setDoc(doc(db, 'threads', thread.id!), {
                ...thread,
                createdAt: serverTimestamp(),
                createdBy: 'system',
                posts: []
            })
        }
    }
} 