"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, TrendingUp, Sparkles, Medal } from "lucide-react"
import type { User } from "@/lib/types"
import { formatPoints, getUserLevel, getLevelProgress } from "@/lib/point-system"
import { Progress } from "@/components/ui/progress"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

export function Leaderboard() {
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<"week" | "alltime">("week")
  const { userProfile } = useAuth()

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userData = snapshot.docs
        .map(doc => ({
          ...doc.data(),
          id: doc.id,
        }))
        .filter(user => user.id !== "anyone") as User[];
      setUsers(userData)
    })

    return () => unsubscribe()
  }, [])

  const currentUserId = userProfile?.id

  // Sort users by weekly points for weekly tab
  const weeklyLeaders = [...users].sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0)).slice(0, 10)

  // Sort users by total points for all-time tab
  const alltimeLeaders = [...users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10)

  const leaders = activeTab === "week" ? weeklyLeaders : alltimeLeaders
  const currentUserRank =
    activeTab === "week"
      ? weeklyLeaders.findIndex((u) => u.id === currentUserId) + 1
      : alltimeLeaders.findIndex((u) => u.id === currentUserId) + 1

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week" className="mb-4" onValueChange={(value) => setActiveTab(value as "week" | "alltime")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="week"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              This Week
            </TabsTrigger>
            <TabsTrigger
              value="alltime"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {leaders.map((user, index) => {
            const isCurrentUser = user.id === currentUserId
            const points = activeTab === "week" ? user.weeklyPoints || 0 : user.points || 0
            const { level, title, nextLevel } = getUserLevel(user.points || 0)
            const levelProgress = getLevelProgress(user.points || 0)

            return (
              <div
                key={user.id}
                className={`flex items-center p-3 rounded-lg relative ${isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"
                  }`}
              >
                <div className="absolute top-0 left-0 h-full w-1 rounded-l-lg bg-primary opacity-30" />
                <div className="flex items-center justify-center w-8 font-bold text-lg">
                  {index === 0 && <Medal className="h-5 w-5 text-yellow-400" />}
                  {index === 1 && <Medal className="h-5 w-5 text-slate-300" />}
                  {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                  {index > 2 && index + 1}
                </div>

                <Avatar className="h-10 w-10 border-2 border-primary/20 mx-3">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "User"} />
                  ) : (
                    <AvatarFallback>
                      {(user.name || "User")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">
                      {user.name} {user.streak ? `🔥${user.streak}` : ""}
                    </div>
                    {isCurrentUser && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">You</span>
                    )}
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span>Level {level}</span>
                    <span className="mx-1">•</span>
                    <span>{title}</span>
                  </div>

                  {nextLevel && (
                    <div className="mt-1 flex items-center gap-2">
                      <Progress value={levelProgress} className="h-1.5 w-full max-w-24" />
                      <span className="text-xs text-muted-foreground">{levelProgress}%</span>
                    </div>
                  )}
                </div>

                <div className="font-bold text-primary ml-2">{formatPoints(points)} pts</div>
              </div>
            )
          })}

          {currentUserRank > 10 && (
            <>
              <div className="text-center text-sm text-muted-foreground py-1">
                <span>...</span>
              </div>

              <div className="flex items-center p-3 rounded-lg bg-primary/10 border border-primary/20 relative">
                <div className="absolute top-0 left-0 h-full w-1 rounded-l-lg bg-primary opacity-30" />
                <div className="flex items-center justify-center w-8 font-bold text-lg">{currentUserRank}</div>

                {users
                  .filter((u) => u.id === currentUserId)
                  .map((user) => (
                    <React.Fragment key={user.id}>
                      <Avatar className="h-10 w-10 border-2 border-primary/20 mx-3">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "User"} />
                        ) : (
                          <AvatarFallback>
                            {(user.name || "User")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">
                            {user.name} {user.streak ? `🔥${user.streak}` : ""}
                          </div>
                          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">You</span>
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span>Level {getUserLevel(user.points || 0).level}</span>
                          <span className="mx-1">•</span>
                          <span>{getUserLevel(user.points || 0).title}</span>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <Progress value={getLevelProgress(user.points || 0)} className="h-1.5 w-full max-w-24" />
                          <span className="text-xs text-muted-foreground">{getLevelProgress(user.points || 0)}%</span>
                        </div>
                      </div>

                      <div className="font-bold text-primary ml-2">
                        {formatPoints(activeTab === "week" ? user.weeklyPoints || 0 : user.points || 0)} pts
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
