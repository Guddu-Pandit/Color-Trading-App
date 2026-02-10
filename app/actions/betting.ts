"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getBettingConfig() {
    try {
        const { data, error } = await supabaseAdmin
            .from('betting_config')
            .select('*')
            .single()
        if (error) return { error: error.message }
        return { data }
    } catch (error) {
        return { error: "Failed to fetch betting config" }
    }
}

export async function getGameState(gameType: string = '60s') {
    try {
        // Get betting config
        const { data: config } = await supabaseAdmin
            .from('betting_config')
            .select('*')
            .single()

        const isPaused = config?.is_paused || (
            gameType === '30s' ? config?.is_paused_30s :
                gameType === '60s' ? config?.is_paused_60s :
                    gameType === '90s' ? config?.is_paused_90s : false
        )

        // Get the current active period
        const { data: period, error } = await supabaseAdmin
            .from('game_periods')
            .select('*')
            .eq('game_type', gameType)
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
            let duration = 60000 // default 60s
            if (gameType === '30s') duration = 30000
            if (gameType === '90s') duration = 90000

            const endTime = new Date(startTime.getTime() + duration)

            const { data: newPeriod, error: createError } = await supabaseAdmin
                .from('game_periods')
                .insert({
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: 'active',
                    game_type: gameType
                })
                .select()
                .single()

            if (createError) {
                return { error: createError.message }
            }
            return { data: { ...newPeriod, is_paused: isPaused ?? false } }
        }

        return { data: { ...period, is_paused: isPaused ?? false } }
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
            .select('*')
            .single()

        // 1. Check if period is still active
        const { data: period, error: periodError } = await supabaseAdmin
            .from('game_periods')
            .select('*')
            .eq('id', periodId)
            .single()

        if (periodError || !period) return { error: "Period not found" }

        const isPaused = config?.is_paused || (
            period.game_type === '30s' ? config?.is_paused_30s :
                period.game_type === '60s' ? config?.is_paused_60s :
                    period.game_type === '90s' ? config?.is_paused_90s : false
        )

        if (isPaused) return { error: "Betting is currently paused by admin" }
        if (period.status !== 'active') return { error: "Betting closed for this period" }

        const now = new Date()
        const endTime = new Date(period.end_time)
        const secondsLeft = (endTime.getTime() - now.getTime()) / 1000

        const lockTime = period.game_type === '30s' ? 10 : 15
        if (secondsLeft <= lockTime) {
            return { error: `Betting closed (last ${lockTime} seconds)` }
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

export async function getRecentResults(gameType: string = '60s') {
    const { data, error } = await supabaseAdmin
        .from('game_periods')
        .select('*')
        .eq('status', 'completed')
        .eq('game_type', gameType)
        .order('end_time', { ascending: false })
        .limit(10)

    if (error) return { error: error.message }
    return { data }
}

import { createClient } from "@/lib/supabase-server"

export async function toggleBetting(paused: boolean, target: 'all' | '30s' | '60s' | '90s' = 'all') {
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

        const updateData: any = {}
        if (target === 'all') updateData.is_paused = paused
        else if (target === '30s') updateData.is_paused_30s = paused
        else if (target === '60s') updateData.is_paused_60s = paused
        else if (target === '90s') updateData.is_paused_90s = paused

        const { error } = await supabaseAdmin
            .from('betting_config')
            .update(updateData)
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

