"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { User } from "@/lib/types"
import { getUserLevel, getLevelProgress } from "@/lib/point-system"
import { Flame, Award, BarChart, TrendingUp } from "lucide-react"

interface UserStatsCardProps {
  user: User
}

export function UserStatsCard({ user }: UserStatsCardProps) {
  const { level, title, nextLevel } = getUserLevel(user.points || 0)
  const progress = getLevelProgress(user.points || 0)

  const currentWeeklyRank = 1 // This would come from calculating the user's rank in app-shell

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Level {level}</p>
              <p className="text-xs text-muted-foreground">{title}</p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <Award className="h-6 w-6 text-primary" />
            </div>
          </div>

          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>{user.points || 0} points</span>
                <span>
                  {nextLevel.points} points for Level {level + 1}
                </span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                {nextLevel.points - (user.points || 0)} points needed for next level:
                <span className="font-medium text-primary ml-1">{nextLevel.title}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium">Streak</span>
              </div>
              <p className="text-2xl font-bold">{user.streak || 0} days</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">Weekly Rank</span>
              </div>
              <p className="text-2xl font-bold">#{currentWeeklyRank}</p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Total Points</p>
                <p className="text-2xl font-bold text-primary">{user.points || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold text-primary">{user.weeklyPoints || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
