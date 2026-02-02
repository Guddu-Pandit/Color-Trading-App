"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toggleBetting, getGameState } from "@/app/actions/betting"
import { toast } from "sonner"
import { PauseCircle, PlayCircle } from "lucide-react"

export function BettingManagement() {
    const [paused, setPaused] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatus = async () => {
            const { data } = await getGameState()
            if (data) {
                setPaused(data.is_paused)
            }
            setLoading(false)
        }
        fetchStatus()
    }, [])

    const handleToggle = async (checked: boolean) => {
        setLoading(true)
        const result = await toggleBetting(checked)
        if (result.success) {
            setPaused(checked)
            toast.success(checked ? "Betting paused" : "Betting resumed")
        } else {
            toast.error(result.error || "Failed to update status")
        }
        setLoading(false)
    }

    if (loading && !paused) return <div>Loading...</div>

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Betting Configuration</CardTitle>
                        <CardDescription>Pause or resume all betting activities site-wide.</CardDescription>
                    </div>
                    {paused ? (
                        <PauseCircle className="h-8 w-8 text-red-500 animate-pulse" />
                    ) : (
                        <PlayCircle className="h-8 w-8 text-green-500" />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="space-y-0.5">
                        <Label htmlFor="betting-toggle" className="text-base">Pause Betting</Label>
                        <p className="text-sm text-muted-foreground">
                            When paused, users cannot place new bets.
                        </p>
                    </div>
                    <Switch
                        id="betting-toggle"
                        checked={paused}
                        onCheckedChange={handleToggle}
                        disabled={loading}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
