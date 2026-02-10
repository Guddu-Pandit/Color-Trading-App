"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGameState, placeBet } from "@/app/actions/betting"
import { AlertCircle, Clock, Lock, PauseCircle } from "lucide-react"

export function BettingPanel({ gameType = '60s' }: { gameType?: string }) {
    const [gameState, setGameState] = useState<any>(null)
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [betAmount, setBetAmount] = useState<number>(10)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const lockTime = gameType === '30s' ? 10 : 15

    const fetchGameState = async () => {
        const { data, error } = await getGameState(gameType)
        if (data) {
            setGameState(data)
            const end = new Date(data.end_time).getTime()
            const now = new Date().getTime()
            setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)))
        }
    }

    useEffect(() => {
        fetchGameState()

        // Subscribe to betting_config changes
        const configChannel = supabase
            .channel('betting_config_updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'betting_config'
            }, (payload) => {
                setGameState((prev: any) => ({ ...prev, is_paused: payload.new.is_paused }))
            })
            .subscribe()

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1))
        }, 1000)

        return () => {
            clearInterval(interval)
            supabase.removeChannel(configChannel)
        }
    }, [])


    useEffect(() => {
        if (timeLeft === 0 && gameState) {
            fetchGameState()
        }
    }, [timeLeft, gameState?.id])

    const handlePlaceBet = async (color: string) => {
        if (timeLeft <= lockTime) return
        setLoading(true)
        setMessage(null)

        const result = await placeBet(gameState.id, color, betAmount)
        if (result.success) {
            setMessage({ type: 'success', text: `Bet placed on ${color} successfully!` })
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to place bet' })
        }
        setLoading(false)
    }

    const isLocked = timeLeft <= lockTime
    const isPaused = gameState?.is_paused

    const modeName = gameType === '30s' ? 'Blitz' : gameType === '90s' ? 'Storm' : 'Rush'

    return (
        <Card className="w-full max-w-2xl mx-auto border-2 border-primary/20 relative overflow-hidden">
            {isPaused && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <PauseCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h3 className="text-2xl font-bold text-foreground">Betting Paused</h3>
                    <p className="text-muted-foreground max-w-[300px]">
                        The administrator has temporarily paused betting. Please check back later.
                    </p>
                </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                <CardTitle className="text-2xl font-bold">{modeName} Betting ({gameType})</CardTitle>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isLocked ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                    {isLocked ? <Lock className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    <span className="font-mono text-xl">{timeLeft}s</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Period ID</p>
                        <p className="text-3xl font-mono font-bold">{gameState?.id || '---'}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Button
                            disabled={isLocked || loading}
                            onClick={() => handlePlaceBet('green')}
                            className="h-20 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-transform active:scale-95"
                        >
                            Green
                        </Button>
                        <Button
                            disabled={isLocked || loading}
                            onClick={() => handlePlaceBet('violet')}
                            className="h-20 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-transform active:scale-95"
                        >
                            Violet
                        </Button>
                        <Button
                            disabled={isLocked || loading}
                            onClick={() => handlePlaceBet('red')}
                            className="h-20 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95"
                        >
                            Red
                        </Button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {[10, 50, 100, 500, 1000].map((amount) => (
                                <Button
                                    key={amount}
                                    variant={betAmount === amount ? "default" : "outline"}
                                    onClick={() => setBetAmount(amount)}
                                    size="sm"
                                    className="min-w-[60px]"
                                >
                                    ₹{amount}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {message && (
                        <div className={`flex items-center gap-2 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            <AlertCircle className="h-4 w-4" />
                            {message.text}
                        </div>
                    )}

                    {isLocked && (
                        <p className="text-center text-red-500 text-sm font-medium animate-pulse">
                            Betting is locked. Wait for the next period.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
