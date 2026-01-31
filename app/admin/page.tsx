export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 bg-card rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-lg text-muted-foreground">Welcome to Admin Panel</h3>
                    <p className="mt-2 text-2xl font-bold">System Status: Active</p>
                </div>
                {/* Placeholder for more stats */}
                <div className="p-6 bg-card rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-lg text-muted-foreground">Users</h3>
                    <p className="mt-2 text-muted-foreground">Manage your application users.</p>
                </div>
            </div>
        </div>
    )
}
