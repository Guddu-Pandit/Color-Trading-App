"use client"

import { BettingPanel } from "@/components/dashboard/BettingPanel"
import { GameResults } from "@/components/dashboard/GameResults"

export default function StormPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Storm (1.30m)
                </h1>
                <p className="text-muted-foreground text-lg">
                    Extended 90-second cycles for careful predictions!
                </p>
            </div>

            <BettingPanel gameType="90s" />
            <GameResults gameType="90s" />
        </div>
    )
}
