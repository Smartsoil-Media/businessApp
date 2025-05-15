"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/sidebar-provider"
import { ArrowLeft, Pencil, Flame, Trophy, Star } from "lucide-react"
import { getUserLevel, getLevelProgress } from "@/lib/point-system"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function ProfilePage() {
  const router = useRouter()
  const { userProfile, setUserProfile } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(userProfile?.name || '')

  if (!userProfile) {
    return <div>Loading...</div>
  }

  const { level, title, nextLevel } = getUserLevel(userProfile.points || 0)
  const progress = getLevelProgress(userProfile.points || 0)

  const handleUpdateUsername = async () => {
    if (!userProfile?.id || !newUsername.trim()) return

    try {
      const userRef = doc(db, 'users', userProfile.id)
      await updateDoc(userRef, {
        name: newUsername.trim()
      })

      setUserProfile({
        ...userProfile,
        name: newUsername.trim()
      })

      toast({
        title: "Profile updated",
        description: "Your username has been updated successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="thread-header flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="max-w-[200px]"
                    />
                    <Button onClick={handleUpdateUsername} size="sm">Save</Button>
                    <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-semibold">{userProfile?.name || userProfile?.id}</h3>
                    <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    {userProfile?.streak || 0} day streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Level {getUserLevel(userProfile?.points || 0).level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {userProfile?.points || 0} points
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </main>
  )
}
