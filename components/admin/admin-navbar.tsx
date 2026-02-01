"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { User as UserIcon, LogOut, ChevronDown, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AdminNavbar() {
    const [user, setUser] = useState<User | null>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')
    const router = useRouter()

    // Conversion rate (approximate)
    const walletAmount = 100
    const conversionRate = 0.012 // 1 INR ≈ 0.012 USD

    const displayAmount = currency === 'INR'
        ? `₹${walletAmount}`
        : `$${(walletAmount * conversionRate).toFixed(2)}`

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

    const handleCurrencyChange = (newCurrency: 'INR' | 'USD') => {
        setCurrency(newCurrency)
        setIsWalletDropdownOpen(false)
    }

    return (
        <nav className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
            <div className="font-semibold text-lg text-foreground">Admin Console</div>

            <div className="flex items-center gap-4">
                {/* Wallet Section with Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 px-3 py-1.5 rounded-full hover:from-green-500/30 hover:to-emerald-500/30 transition-all cursor-pointer"
                    >
                        <Wallet className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">{displayAmount}</span>
                    </button>

                    {isWalletDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                            <div className="px-3 py-2 border-b border-border">
                                <p className="text-xs font-medium text-muted-foreground">Select Currency</p>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={() => handleCurrencyChange('INR')}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${currency === 'INR' ? 'bg-green-500/20 text-green-500' : 'hover:bg-accent text-foreground'}`}
                                >
                                    <span className="font-semibold">₹</span>
                                    <span>Indian Rupee</span>
                                    {currency === 'INR' && <span className="ml-auto">✓</span>}
                                </button>
                                <button
                                    onClick={() => handleCurrencyChange('USD')}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${currency === 'USD' ? 'bg-green-500/20 text-green-500' : 'hover:bg-accent text-foreground'}`}
                                >
                                    <span className="font-semibold">$</span>
                                    <span>US Dollar</span>
                                    {currency === 'USD' && <span className="ml-auto">✓</span>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Section */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-accent p-2 rounded-md transition-colors"
                    >
                        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium hidden sm:block text-foreground">
                            {user?.user_metadata?.full_name || "Admin"}
                        </span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                            <div className="px-3 py-2 border-b border-border">
                                <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                                <p className="text-sm font-medium truncate text-foreground">{user?.email}</p>
                            </div>
                            <div className="p-1">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
