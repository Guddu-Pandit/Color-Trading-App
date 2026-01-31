"use client"

import { useEffect, useState } from "react"
import { getUsers } from "@/app/actions/admin"
import { UserTable } from "@/components/admin/user-table"
import { supabase } from "@/lib/supabase"

interface User {
    id: string
    email: string
    full_name: string
    role: 'user' | 'admin' | 'super_admin'
    created_at: string
    status: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'super_admin'>('admin')
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            // Get current user's role
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setCurrentUserId(user.id)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
                    setCurrentUserRole(profile.role as 'admin' | 'super_admin')
                }
            }

            // Get all users
            const result = await getUsers()
            if (result.error) {
                setError(result.error)
            } else {
                setUsers(result.data || [])
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return <div className="p-4 text-muted-foreground">Loading users...</div>
    }

    if (error) {
        return <div className="p-4 text-destructive">Error loading users: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            </div>
            <UserTable users={users} currentUserRole={currentUserRole} currentUserId={currentUserId} />
        </div>
    )
}

