"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { User as UserIcon, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AdminNavbar() {
    const [user, setUser] = useState<User | null>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <nav className="h-16 border-b px-6 flex items-center justify-between bg-background">
            <div className="font-semibold text-lg">Admin Console</div>

            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-muted p-2 rounded-md transition-colors"
                >
                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                        {user?.user_metadata?.full_name || "Admin"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-md shadow-lg py-1 z-50">
                        <div className="px-3 py-2 border-b">
                            <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
