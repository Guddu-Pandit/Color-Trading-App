"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

interface RechargeRequest {
    id: string
    user_id: string
    amount: number
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    updated_at: string
    profiles: {
        email: string
        full_name: string
    }
}

export default function AdminRechargesPage() {
    const [requests, setRequests] = useState<RechargeRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('recharge_requests')
                .select('*, profiles(email, full_name)')
                .order('created_at', { ascending: false })

            if (error) throw error
            setRequests(data || [])
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch requests")
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        setProcessingId(id)
        try {
            const { error } = await supabase.rpc('approve_recharge_request', { request_id: id })
            if (error) throw error
            toast.success("Request approved and balance updated")
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message || "Failed to approve request")
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (id: string) => {
        setProcessingId(id)
        try {
            const { error } = await supabase
                .from('recharge_requests')
                .update({ status: 'rejected', updated_at: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error
            toast.success("Request rejected")
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message || "Failed to reject request")
        } finally {
            setProcessingId(null)
        }
    }

    const filteredRequests = requests.filter(req =>
        req.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Recharge Management</h1>
                    <p className="text-muted-foreground">Approve or reject user recharge requests.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user or email..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Requests</CardTitle>
                    <CardDescription>A list of all recharge requests from users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            Loading requests...
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            No requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="font-medium">{req.profiles?.full_name || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{req.profiles?.email}</div>
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-green-500">
                                                ₹{req.amount}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={
                                                    req.status === 'approved' ? 'default' :
                                                        req.status === 'rejected' ? 'destructive' :
                                                            'outline'
                                                } className={req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}>
                                                    {req.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {new Date(req.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {req.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/20"
                                                            onClick={() => handleApprove(req.id)}
                                                            disabled={processingId === req.id}
                                                        >
                                                            {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                                                            onClick={() => handleReject(req.id)}
                                                            disabled={processingId === req.id}
                                                        >
                                                            {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
