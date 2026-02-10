"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toggleBetting, getBettingConfig } from "@/app/actions/betting"
import { toast } from "sonner"
import { PauseCircle, PlayCircle, Zap, Timer, Gamepad2, Globe } from "lucide-react"

export function BettingManagement() {
    const [config, setConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchStatus = async () => {
        setLoading(true)
        const { data } = await getBettingConfig()
        if (data) {
            setConfig(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const handleToggle = async (checked: boolean, target: 'all' | '30s' | '60s' | '90s') => {
        const result = await toggleBetting(checked, target)
        if (result.success) {
            toast.success(`${target === 'all' ? 'All betting' : target + ' mode'} ${checked ? "paused" : "resumed"}`)
            fetchStatus()
        } else {
            toast.error(result.error || "Failed to update status")
        }
    }

    if (!config && loading) return <div className="p-8 text-center animate-pulse">Loading Configuration...</div>

    const controls = [
        {
            id: 'all',
            label: 'Global Pause',
            description: 'Pause all betting regardless of mode.',
            icon: Globe,
            checked: config?.is_paused,
            color: 'text-red-500'
        },
        {
            id: '30s',
            label: 'Blitz (30s) Pause',
            description: 'Pause only 30-second games.',
            icon: Zap,
            checked: config?.is_paused_30s,
            color: 'text-yellow-500'
        },
        {
            id: '60s',
            label: 'Rush (60s) Pause',
            description: 'Pause only 60-second games.',
            icon: Timer,
            checked: config?.is_paused_60s,
            color: 'text-blue-500'
        },
        {
            id: '90s',
            label: 'Storm (90s) Pause',
            description: 'Pause only 90-second games.',
            icon: Gamepad2,
            checked: config?.is_paused_90s,
            color: 'text-purple-500'
        }
    ]

    const isGloballyPaused = config?.is_paused

    return (
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-border/50 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            Betting Controls
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground mt-1">
                            Manage active betting modes and system-wide pauses.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-full border border-border">
                        <span className="text-sm font-medium">System Status:</span>
                        {isGloballyPaused ? (
                            <div className="flex items-center gap-2 text-red-500">
                                <PauseCircle className="h-5 w-5 animate-pulse" />
                                <span className="font-bold">PAUSED</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-green-500">
                                <PlayCircle className="h-5 w-5" />
                                <span className="font-bold">LIVE</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {controls.map((control) => (
                        <div
                            key={control.id}
                            className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-300 ${control.id === 'all'
                                    ? 'bg-red-500/5 border-red-500/20'
                                    : 'bg-muted/40 border-border/50 hover:bg-muted/60'
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-lg bg-background shadow-sm ${control.color}`}>
                                    <control.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`toggle-${control.id}`} className="text-lg font-bold leading-none cursor-pointer">
                                        {control.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {control.description}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id={`toggle-${control.id}`}
                                checked={control.checked}
                                onCheckedChange={(checked) => handleToggle(checked, control.id as any)}
                                disabled={loading}
                                className="scale-110"
                            />
                        </div>
                    ))}
                </div>

                {isGloballyPaused && (
                    <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-500">
                        <PauseCircle className="h-5 w-5" />
                        <p className="text-sm font-medium">
                            <span className="font-bold">Note:</span> Global Pause is active. All betting is currently disabled regardless of individual mode settings.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
