import { useState, useEffect } from "react"
import { LayoutDashboard, ChevronLeft, ChevronRight, Settings, CreditCard, Shield, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

import { usePathname } from "next/navigation"

interface SidebarProps {
    isCollapsed: boolean
    toggleCollapse: () => void
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname()
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
                    setIsAdmin(true)
                }
            }
        }
        checkRole()
    }, [])

    return (
        <aside
            className={cn(
                "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col relative",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="p-4 flex items-center justify-between border-b border-sidebar-border h-16">
                {!isCollapsed && <span className="font-bold text-lg text-sidebar-foreground">Dashboard</span>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className={cn("h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent", isCollapsed && "mx-auto")}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <nav className="flex-1 p-2 space-y-2">

                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors text-sm font-medium",
                        pathname === "/" ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    {!isCollapsed && <span>Dashboard</span>}
                </Link>

                <Link
                    href="/game"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors text-sm font-medium",
                        pathname === "/game" ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <Gamepad2 className="h-5 w-5" />
                    {!isCollapsed && <span>Play</span>}
                </Link>

                <Link
                    href="/transactions"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors text-sm font-medium",
                        pathname === "/transactions" ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <CreditCard className="h-5 w-5" />
                    {!isCollapsed && <span>Transactions</span>}
                </Link>

                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors text-sm font-medium",
                        pathname === "/settings" ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <Settings className="h-5 w-5" />
                    {!isCollapsed && <span>Settings</span>}
                </Link>
            </nav>

            <div className="p-2 border-t border-sidebar-border mt-auto">
                {isAdmin && (
                    <Link
                        href="/admin"
                        className={cn(
                            "flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors text-sm font-medium",
                            pathname.startsWith("/admin") ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70",
                            isCollapsed ? "justify-center" : ""
                        )}
                    >
                        <Shield className="h-5 w-5" />
                        {!isCollapsed && <span>Admin Panel</span>}
                    </Link>
                )}
            </div>
        </aside>
    )
}
