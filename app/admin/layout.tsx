"use client"

import { useEffect, useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { supabase } from "@/lib/supabase"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)

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
            }
            setLoading(false)
        }

        checkAuth()
    }, [router])

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if (!authorized) {
        return null // Will redirect
    }

    return (
        <div className="flex bg-muted/40 h-screen w-full">
            <AdminSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <AdminNavbar />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
