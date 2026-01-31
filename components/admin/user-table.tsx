"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, ShieldAlert, Trash, UserCog } from "lucide-react"
import { deleteUser, updateUserRole } from "@/app/actions/admin"

interface User {
    id: string
    email: string
    full_name: string
    role: 'user' | 'admin' | 'super_admin'
    created_at: string
    status: string
    last_sign_in_at?: string
}

interface UserTableProps {
    users: User[]
}

export function UserTable({ users }: UserTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return

        setLoadingId(userId)
        const result = await deleteUser(userId)
        setLoadingId(null)

        if (result.error) {
            alert("Error deleting user: " + result.error)
        }
    }

    const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
        setLoadingId(userId)
        const result = await updateUserRole(userId, newRole)
        setLoadingId(null)

        if (result.error) {
            alert("Error updating role: " + result.error)
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        {/* Phone column removed as requested */}
                        <TableHead>Roles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{user.full_name || 'N/A'}</span>
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {user.role === 'super_admin' ? 'platform_super_admin' : user.role === 'admin' ? 'Admin' : 'User'}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${user.status === 'Active'
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-zinc-500 text-white hover:bg-zinc-600'
                                    }`}>
                                    {user.status}
                                </div>
                            </TableCell>
                            <TableCell>
                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loadingId === user.id}>
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'admin')}>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Make Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'user')}>
                                            <UserCog className="mr-2 h-4 w-4" />
                                            Demote to User
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
