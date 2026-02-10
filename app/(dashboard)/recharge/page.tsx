"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, IndianRupee, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface RechargeRequest {
    id: string
    amount: number
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

export default function RechargePage() {
    const router = useRouter()
    const [amount, setAmount] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [balance, setBalance] = useState<number>(0)

    useEffect(() => {
        const fetchBalance = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('balance')
                    .eq('id', user.id)
                    .single()
                if (profile) setBalance(profile.balance)

                const channel = supabase
                    .channel('recharge_balance_sync')
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    }, (payload) => {
                        setBalance(payload.new.balance)
                    })
                    .subscribe()

                return () => { supabase.removeChannel(channel) }
            }
        }
        fetchBalance()
    }, [])


    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault()
        const rechargeAmount = parseFloat(amount)

        if (isNaN(rechargeAmount) || rechargeAmount < 100) {
            toast.error("Minimum recharge amount is ₹100")
            return
        }

        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase
                .from('recharge_requests')
                .insert({
                    user_id: user.id,
                    amount: rechargeAmount,
                    status: 'pending'
                })

            if (error) throw error

            toast.success("Request submitted")
            setAmount("")
            router.push('/transactions')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit request")
        } finally {
            setIsLoading(false)
        }
    }

    // Modern preset values
    const presets = [100, 500, 1000, 5000]

    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Add Funds</h1>
                <p className="text-muted-foreground text-sm">Securely add money to your wallet.</p>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">₹{balance.toLocaleString()}</div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRecharge} className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-sm font-medium block">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="pl-8 h-12 text-lg"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {presets.map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setAmount(val.toString())}
                                        className={cn(
                                            "py-2 text-xs font-medium rounded-md border transition-all",
                                            amount === val.toString()
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background hover:bg-muted border-input"
                                        )}
                                    >
                                        ₹{val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            className="w-full h-11"
                            disabled={isLoading || parseFloat(amount) < 100}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Confirm Recharge
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            By continuing, you agree to our Terms of Service. Checks usually take 10-30m.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
