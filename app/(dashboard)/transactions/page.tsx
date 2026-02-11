"use client"

import { usePathname } from "next/navigation"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface TransactionItem {
    id: string
    amount: number
    created_at: string
    status: string
    type: 'bet' | 'recharge'
    color?: string
}

export default function TransactionsPage() {
    const [loading, setLoading] = useState(true)
    const [bets, setBets] = useState<TransactionItem[]>([])
    const [recharges, setRecharges] = useState<TransactionItem[]>([])

    const pathname = usePathname()

    useEffect(() => {
        fetchData()
    }, [pathname])

    const fetchData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const [betsRes, rechargesRes] = await Promise.all([
                supabase.from('bets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('recharge_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            ])

            setBets((betsRes.data || []).map(b => ({ ...b, type: 'bet' as const })))
            setRecharges((rechargesRes.data || []).map(r => ({ ...r, type: 'recharge' as const })))
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <p className="text-muted-foreground">View and manage your financial activity.</p>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="bets">Bets</TabsTrigger>
                    <TabsTrigger value="recharges">Recharges</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    <HistoryTable
                        items={[
                            ...bets,
                            ...recharges
                        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())}
                        loading={loading}
                    />
                </TabsContent>

                <TabsContent value="bets" className="mt-4">
                    <HistoryTable items={bets} loading={loading} />
                </TabsContent>

                <TabsContent value="recharges" className="mt-4">
                    <HistoryTable items={recharges} loading={loading} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function HistoryTable({ items, loading }: { items: TransactionItem[], loading: boolean }) {
    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    if (items.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-12 text-muted-foreground">
                    No transactions found.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>Activity History</CardTitle>
                <CardDescription>Records of your gaming and wallet activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.type === 'recharge' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {item.type === 'recharge' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="font-semibold capitalize">
                                        {item.type === 'bet' ? `Bet on ${item.color || 'Color'}` : 'Wallet Recharge'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(item.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${item.type === 'recharge' ? 'text-green-500' : 'text-foreground'}`}>
                                    {item.type === 'recharge' ? '+' : '-'}₹{item.amount}
                                </p>
                                <Badge variant={
                                    item.status === 'win' || item.status === 'approved' ? 'default' :
                                        item.status === 'loss' || item.status === 'rejected' ? 'destructive' :
                                            'outline'
                                } className="text-[10px] h-5">
                                    {item.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

