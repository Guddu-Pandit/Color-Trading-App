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
    currentUserRole: 'admin' | 'super_admin'
    currentUserId: string
}

export function UserTable({ users, currentUserRole, currentUserId }: UserTableProps) {
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
        const result = await updateUserRole(userId, newRole, currentUserId)
        setLoadingId(null)

        if (result.error) {
            alert("Error updating role: " + result.error)
        }
    }

    // Check if current user can perform actions on target user
    const canMakeAdmin = (targetRole: string) => {
        // Both admin and super_admin can make users into admins
        return targetRole === 'user'
    }

    const canDemoteToUser = (targetRole: string) => {
        // Only super_admin can demote admins to users
        // Admin cannot demote other admins
        if (targetRole === 'admin') {
            return currentUserRole === 'super_admin'
        }
        return false
    }

    const canDeleteUser = (targetRole: string) => {
        // Admin can only delete regular users
        // Super_admin can delete users and admins
        if (targetRole === 'super_admin') return false
        if (targetRole === 'admin') return currentUserRole === 'super_admin'
        return true
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'super_admin': return 'Super Admin'
            case 'admin': return 'Admin'
            default: return 'User'
        }
    }

    const getRoleBadgeClasses = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            case 'admin':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            default:
                return 'bg-secondary text-secondary-foreground border-border'
        }
    }

    return (
        <div className="rounded-md border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                        <TableHead className="text-muted-foreground">User</TableHead>
                        <TableHead className="text-muted-foreground">Role</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Created</TableHead>
                        <TableHead className="text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} className="border-border hover:bg-muted/50">
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{user.full_name || 'N/A'}</span>
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${user.status === 'Active'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                                    }`}>
                                    {user.status}
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" disabled={loadingId === user.id}>
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-popover border-border">
                                        <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-border" />
                                        {canMakeAdmin(user.role) && (
                                            <DropdownMenuItem
                                                onClick={() => handleRoleUpdate(user.id, 'admin')}
                                                className="text-foreground hover:bg-muted"
                                            >
                                                <Shield className="mr-2 h-4 w-4" />
                                                Make Admin
                                            </DropdownMenuItem>
                                        )}
                                        {canDemoteToUser(user.role) && (
                                            <DropdownMenuItem
                                                onClick={() => handleRoleUpdate(user.id, 'user')}
                                                className="text-foreground hover:bg-muted"
                                            >
                                                <UserCog className="mr-2 h-4 w-4" />
                                                Demote to User
                                            </DropdownMenuItem>
                                        )}
                                        {(canMakeAdmin(user.role) || canDemoteToUser(user.role)) && canDeleteUser(user.role) && (
                                            <DropdownMenuSeparator className="bg-border" />
                                        )}
                                        {canDeleteUser(user.role) && (
                                            <DropdownMenuItem
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        )}
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

