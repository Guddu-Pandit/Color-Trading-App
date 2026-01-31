"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Settings, LogOut, ArrowLeft } from "lucide-react"

export function AdminSidebar() {
    const pathname = usePathname()

    const links = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/admin/users",
            label: "User Management",
            icon: Users,
        },
    ]

    return (
        <div className="flex h-screen flex-col border-r border-border bg-sidebar w-64">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-sidebar-foreground">Admin Panel</h2>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                {links.map((link) => {
                    const Icon = link.icon
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent",
                                pathname === link.href ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Return to User
                </Link>
            </div>
        </div>
    )
}
