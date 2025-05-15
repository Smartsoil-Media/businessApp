"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from 'firebase/auth'
import { auth } from './firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { DbUser } from './db-types'

interface AuthContextType {
    user: User | null
    userProfile: DbUser | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    setUserProfile: (profile: DbUser) => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
    setUserProfile: () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userProfile, setUserProfile] = useState<DbUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)
            if (user) {
                // Fetch user profile
                const userDoc = await getDoc(doc(db, 'users', user.uid))
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data() as DbUser)
                }
            } else {
                setUserProfile(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const createUserProfile = async (user: User) => {
        const newUser: DbUser = {
            id: user.uid,
            email: user.email!,
            name: user.email!.split('@')[0], // Default name from email
            streak: 0,
            points: 0,
            weeklyPoints: 0,
            createdAt: serverTimestamp(),
            pointsHistory: []
        }

        await setDoc(doc(db, 'users', user.uid), newUser)
        return newUser
    }

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
        } catch (error) {
            console.error('Auth error:', error)
            throw error
        }
    }

    const signUp = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const profile = await createUserProfile(userCredential.user)
            setUserProfile(profile)
        } catch (error) {
            console.error('Sign up error:', error)
            throw error
        }
    }

    const signOut = async () => {
        try {
            await firebaseSignOut(auth)
        } catch (error) {
            console.error('Sign out error:', error)
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            loading,
            signIn,
            signUp,
            signOut,
            setUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)