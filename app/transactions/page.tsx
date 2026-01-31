"use client"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TransactionsPage() {
    return (
        <DashboardShell>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">View and manage your transaction history.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>A list of your recent financial activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            No transactions found.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    )
}
