"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getUsers() {
    try {
        // Query the SQL View 'admin_users' which handles joining and status calculation
        // Using supabaseAdmin to ensure we have permission to read the view (which accesses auth.users)
        const { data: users, error } = await supabaseAdmin
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching users from view:", error)
            return { error: error.message }
        }

        return { data: users }
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

export async function updateUserRole(userId: string, newRole: 'user' | 'admin' | 'super_admin') {
    try {
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
