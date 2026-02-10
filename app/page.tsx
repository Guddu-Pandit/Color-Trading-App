"use client"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Color Trading
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Welcome to your dashboard. Ready to test your luck?
          </p>
          <div className="flex justify-center pt-4">
            <Button asChild size="lg" className="w-48 text-lg font-semibold h-12">
              <Link href="/game">
                Start Playing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}