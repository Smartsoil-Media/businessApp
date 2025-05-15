"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
    const { user, signIn, signUp } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        if (user) {
            console.log("User is logged in, redirecting...")
            router.replace("/")
        }
    }, [user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (isSignUp) {
                await signUp(email, password)
                toast({
                    title: "Account created",
                    description: "Successfully created your account",
                })
            } else {
                await signIn(email, password)
            }
            router.replace("/")
        } catch (error) {
            console.error("Auth error:", error)
            toast({
                title: "Error",
                description: "Invalid email or password",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <Button
                            variant="link"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm"
                        >
                            {isSignUp
                                ? "Already have an account? Sign in"
                                : "Need an account? Sign up"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 