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
        <div className="flex h-screen flex-col border-r bg-background w-64">
            <div className="p-6">
                <h2 className="text-xl font-bold">Admin Panel</h2>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                {links.map((link) => {
                    const Icon = link.icon
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                pathname === link.href ? "bg-muted" : "text-muted-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t">
                <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Return to User
                </Link>
            </div>
        </div>
    )
}
