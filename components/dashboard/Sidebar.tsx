"use client"

import { LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SidebarProps {
    isCollapsed: boolean
    toggleCollapse: () => void
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
    return (
        <aside
            className={cn(
                "bg-gray-50 dark:bg-gray-900 border-r transition-all duration-300 flex flex-col relative",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="p-4 flex items-center justify-between border-b h-16">
                {!isCollapsed && <span className="font-bold text-lg">Dashboard</span>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className={cn("h-8 w-8", isCollapsed && "mx-auto")}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <nav className="flex-1 p-2 space-y-2">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    {!isCollapsed && <span>Dashboard</span>}
                </Link>
                {/* Add more links here */}
            </nav>
        </aside>
    )
}
