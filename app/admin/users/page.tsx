import { getUsers } from "@/app/actions/admin"
import { UserTable } from "@/components/admin/user-table"

export default async function AdminUsersPage() {
    const result = await getUsers()

    if (result.error) {
        return <div className="p-4 text-red-500">Error loading users: {result.error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">User Management</h1>
            </div>
            <UserTable users={result.data || []} />
        </div>
    )
}
