"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getGameState() {
    try {
        // Get betting config
        const { data: config } = await supabaseAdmin
            .from('betting_config')
            .select('is_paused')
            .single()

        // Get the current active period
        const { data: period, error } = await supabaseAdmin
            .from('game_periods')
            .select('*')
            .or('status.eq.active,status.eq.locked')
            .order('start_time', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching game state:", error)
            return { error: error.message }
        }

        // If no active period, create one (simple automation for MVP)
        if (!period) {
            const startTime = new Date()
            const endTime = new Date(startTime.getTime() + 60000) // 60 seconds cycle

            const { data: newPeriod, error: createError } = await supabaseAdmin
                .from('game_periods')
                .insert({
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: 'active'
                })
                .select()
                .single()

            if (createError) {
                return { error: createError.message }
            }
            return { data: { ...newPeriod, is_paused: config?.is_paused ?? false } }
        }

        return { data: { ...period, is_paused: config?.is_paused ?? false } }
    } catch (error) {
        console.error("Unexpected error in getGameState:", error)
        return { error: "An unexpected error occurred" }
    }
}

export async function placeBet(periodId: number, color: string, amount: number) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: "Unauthorized" }

        // 0. Check if betting is paused
        const { data: config } = await supabaseAdmin
            .from('betting_config')
            .select('is_paused')
            .single()

        if (config?.is_paused) return { error: "Betting is currently paused by admin" }

        // 1. Check if period is still active
        const { data: period, error: periodError } = await supabaseAdmin
            .from('game_periods')
            .select('*')
            .eq('id', periodId)
            .single()

        if (periodError || !period) return { error: "Period not found" }
        if (period.status !== 'active') return { error: "Betting closed for this period" }

        const now = new Date()
        const endTime = new Date(period.end_time)
        const secondsLeft = (endTime.getTime() - now.getTime()) / 1000

        if (secondsLeft <= 15) {
            return { error: "Betting closed (last 15 seconds)" }
        }

        // 2. Check user balance
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) return { error: "User profile not found" }
        if (profile.balance < amount) return { error: "Insufficient balance" }

        // 3. Deduct balance and insert bet in a transaction-like way (for MVP)
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ balance: profile.balance - amount })
            .eq('id', user.id)

        if (updateError) return { error: "Failed to update balance" }

        const { error: betError } = await supabaseAdmin
            .from('bets')
            .insert({
                user_id: user.id,
                period_id: periodId,
                color,
                amount,
                status: 'pending'
            })

        if (betError) {
            // Rollback balance (not ideal, but works for MVP without true transactions)
            await supabaseAdmin
                .from('profiles')
                .update({ balance: profile.balance })
                .eq('id', user.id)
            return { error: "Failed to place bet" }
        }

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error("Unexpected error in placeBet:", error)
        return { error: "An unexpected error occurred" }
    }
}

export async function getRecentResults() {
    const { data, error } = await supabaseAdmin
        .from('game_periods')
        .select('*')
        .eq('status', 'completed')
        .order('end_time', { ascending: false })
        .limit(10)

    if (error) return { error: error.message }
    return { data }
}

import { createClient } from "@/lib/supabase-server"

export async function toggleBetting(paused: boolean) {
    try {
        const supabaseServer = await createClient()
        const { data: authData, error: authError } = await supabaseServer.auth.getUser()

        if (authError || !authData.user) {
            console.error("Auth error in toggleBetting:", authError)
            return { error: `Unauthorized (${authError?.message || "No User"})` }
        }

        const user = authData.user

        // Verify admin role strictly on server
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
            return { error: "Unauthorized (Not Admin)" }
        }

        const { error } = await supabaseAdmin
            .from('betting_config')
            .update({ is_paused: paused })
            .eq('id', 1)

        if (error) return { error: error.message }

        revalidatePath('/')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error("Unexpected error in toggleBetting:", error)
        return { error: "An unexpected error occurred" }
    }
}

