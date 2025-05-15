"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User } from "@/lib/types"
import { formatTimeAgo } from "@/lib/utils"
import { Award, CheckCircle, MessageSquare, Lightbulb, UserCheck, Flame } from "lucide-react"

interface PointsHistoryProps {
  user: User
  limit?: number
}

export function PointsHistory({ user, limit }: PointsHistoryProps) {
  const activities = user.pointsHistory || []
  const displayActivities = limit ? activities.slice(0, limit) : activities

  // Function to get appropriate icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_complete":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "idea_shared":
        return <Lightbulb className="h-4 w-4 text-yellow-400" />
      case "reply_added":
        return <MessageSquare className="h-4 w-4 text-blue-400" />
      case "task_assigned":
        return <UserCheck className="h-4 w-4 text-primary" />
      case "streak_bonus":
        return <Flame className="h-4 w-4 text-red-400" />
      case "challenge_complete":
        return <Award className="h-4 w-4 text-purple-400" />
      default:
        return <Award className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (!displayActivities.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Points History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No points activity yet. Start working on tasks to earn points!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Points History</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-0">
            {displayActivities.map((activity) => (
              <div key={activity.id} className="flex items-center py-3 px-2 border-b border-border/30 last:border-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="ml-3 flex-1">
                  <div className="text-sm">{activity.description}</div>
                  <div className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</div>
                </div>

                <div className="font-bold text-sm text-primary">+{activity.points}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
