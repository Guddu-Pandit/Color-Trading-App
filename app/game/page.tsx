"use client"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { BettingPanel } from "@/components/dashboard/BettingPanel"
import { GameResults } from "@/components/dashboard/GameResults"

export default function GamePage() {
    return (
        <DashboardShell>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Color Trading
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Win big by predicting the next color!
                    </p>
                </div>

                <BettingPanel />
                <GameResults />
            </div>
        </DashboardShell>
    )
}
