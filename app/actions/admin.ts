"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getUsers() {
    try {
        // Fetch from profiles table (which now has the status column)
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false })

        if (profilesError) {
            console.error("Error fetching profiles:", profilesError)
            return { error: profilesError.message }
        }

        // Fetch auth users for email and created_at
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        })

        if (authError) {
            console.error("Error fetching auth users:", authError)
            return { error: authError.message }
        }

        // Merge data
        const mergedUsers = profiles.map(profile => {
            const authUser = authUsers.find(u => u.id === profile.id)
            return {
                id: profile.id,
                full_name: profile.full_name,
                email: authUser?.email || profile.email || 'N/A',
                role: profile.role,
                status: profile.status || 'Active',
                created_at: authUser?.created_at || profile.updated_at
            }
        })

        // Sort by created_at desc
        mergedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        return { data: mergedUsers }
    } catch (error) {
        console.error("Unexpected error fetching users:", error)
        return { error: "An unexpected error occurred" }
    }
}

export async function deleteUser(userId: string) {
    try {
        // 1. Delete from auth.users (this requires service role)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authError) {
            console.error("Error deleting auth user:", authError)
            return { error: authError.message }
        }

        // 2. Profile should be deleted by CASCADE foreign key, but good to verify or handle manual cleanup if needed.
        // Our schema has: FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
        // So deleting auth user is sufficient.

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Unexpected error deleting user:", error)
        return { error: "An unexpected error occurred" }
    }
}

export async function updateUserRole(userId: string, newRole: 'user' | 'admin' | 'super_admin', currentUserId?: string) {
    try {
        // If currentUserId is provided, validate permissions
        if (currentUserId) {
            // Get current user's role
            const { data: currentUserProfile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', currentUserId)
                .single()

            // Get target user's current role
            const { data: targetUserProfile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            if (currentUserProfile && targetUserProfile) {
                const currentUserRole = currentUserProfile.role
                const targetUserRole = targetUserProfile.role

                // Super admins cannot be demoted
                if (targetUserRole === 'super_admin') {
                    return { error: "Cannot modify super admin role" }
                }

                // Regular admins cannot demote other admins
                if (currentUserRole === 'admin' && targetUserRole === 'admin' && newRole === 'user') {
                    return { error: "Admins cannot demote other admins. Only super admins can do this." }
                }

                // Regular admins cannot promote to super_admin
                if (currentUserRole === 'admin' && newRole === 'super_admin') {
                    return { error: "Only super admins can promote users to super admin" }
                }
            }
        }

        // We update the public.profiles table.
        // Since RLS probably restricts updates to "Users can update own profile",
        // we MUST use supabaseAdmin to update OTHER users' roles.

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) {
            console.error("Error updating user role:", error)
            return { error: error.message }
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Unexpected error updating role:", error)
        return { error: "An unexpected error occurred" }
    }
}
