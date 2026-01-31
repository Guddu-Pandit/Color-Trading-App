"use client"

import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default function Home() {
  return (
    <DashboardShell>
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold underline">
          Hello world!
        </h1>
        <p>Welcome to the dashboard.</p>
      </div>
    </DashboardShell>
  )
}