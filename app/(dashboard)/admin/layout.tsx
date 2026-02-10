"use client"

import { useEffect, useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'super_admin' | null>(null)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
                router.push("/")
            } else {
                setAuthorized(true)
                setCurrentUserRole(profile.role as 'admin' | 'super_admin')
            }
            setLoading(false)
        }

        checkAuth()
    }, [router])

    if (loading) {
        return <div className="dark flex items-center justify-center h-screen bg-background text-foreground">Loading...</div>
    }

    if (!authorized) {
        return null // Will redirect
    }

    return (
        <div className="animate-in fade-in duration-500 h-full">
            {children}
        </div>
    )
}
