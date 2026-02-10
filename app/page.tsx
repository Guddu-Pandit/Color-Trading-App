"use client"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gamepad2, Timer, Zap } from "lucide-react"

export default function Home() {
  const gameModes = [
    {
      title: "Rush (60s)",
      description: "The standard experience with 60-second cycles.",
      href: "/rush",
      icon: Timer,
      color: "text-blue-500",
    },
    {
      title: "Blitz (30s)",
      description: "Fast-paced action! Only 30 seconds per round.",
      href: "/blitz",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Storm (1.30m)",
      description: "Take your time to analyze and predict.",
      href: "/storm",
      icon: Gamepad2,
      color: "text-purple-500",
    }
  ]

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Color Trading
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Choose your preferred game speed and start winning!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {gameModes.map((mode) => (
            <div key={mode.href} className="group relative bg-card hover:bg-accent/50 border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-full bg-background shadow-sm ${mode.color}`}>
                  <mode.icon className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {mode.description}
                  </p>
                </div>
                <Button asChild className="w-full mt-4 group-hover:bg-primary">
                  <Link href={mode.href}>
                    Play Now
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}