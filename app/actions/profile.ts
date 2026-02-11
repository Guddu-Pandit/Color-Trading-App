"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: {
    full_name: string
    email: string
}): Promise<{ success?: boolean; data?: any; error?: string }> {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: "Not authenticated" }
    }

    try {
        // Update Auth User (Email and MetaData)
        const { data: updateData, error: authError } = await supabase.auth.updateUser({
            email: formData.email,
            data: { full_name: formData.full_name }
        })

        if (authError) {
            return { error: authError.message }
        }

        // Update Profiles Table
        // Note: We update the email in the profiles table to match the REQUESTED email.
        // If verification is required, auth.users.email will only update after verification,
        // but profiles.email will show the new intended email.
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                email: formData.email,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (profileError) {
            return { error: profileError.message }
        }

        revalidatePath('/settings')
        return { success: true, data: updateData.user }
    } catch (error) {
        return { error: "An unexpected error occurred" }
    }
}

export async function getProfile() {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: "Not authenticated" }
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) {
        return { error: profileError.message }
    }

    return { data: profile }
}
