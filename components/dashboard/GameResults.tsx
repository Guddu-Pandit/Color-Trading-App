"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentResults } from "@/app/actions/betting"
import { supabase } from "@/lib/supabase"

export function GameResults({ gameType = '60s' }: { gameType?: string }) {
    const [results, setResults] = useState<any[]>([])

    const fetchResults = async () => {
        const { data } = await getRecentResults(gameType)
        if (data) setResults(data)
    }

    useEffect(() => {
        fetchResults()

        // Subscribe to game period changes
        const channel = supabase
            .channel('game_results')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'game_periods',
                filter: `status=eq.completed&game_type=eq.${gameType}`
            }, () => {
                fetchResults()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {results.map((res) => (
                        <div key={res.id} className="flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${res.result_color === 'green' ? 'bg-green-600' :
                                res.result_color === 'red' ? 'bg-red-600' :
                                    res.result_color === 'violet' ? 'bg-purple-600' : 'bg-gray-400'
                                }`}>
                                {res.result_number ?? '?'}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{res.id}</span>
                        </div>
                    ))}
                    {results.length === 0 && <p className="col-span-10 text-center text-muted-foreground text-sm py-4">No results yet.</p>}
                </div>
            </CardContent>
        </Card>
    )
}
