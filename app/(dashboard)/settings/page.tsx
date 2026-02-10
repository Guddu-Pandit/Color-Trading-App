"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Manage your public profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <div className="p-2 border rounded-md bg-muted/50 text-sm">johndoe</div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="p-2 border rounded-md bg-muted/50 text-sm">john@example.com</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                        <CardDescription>Manage your app preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Notifications</Label>
                                <div className="text-sm text-muted-foreground">Receive email notifications about activity.</div>
                            </div>
                            {/* Switch component would go here */}
                            <div className="text-sm">Enabled</div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Theme</Label>
                                <div className="text-sm text-muted-foreground">Customize the look and feel.</div>
                            </div>
                            {/* Theme selector would go here */}
                            <div className="text-sm">System</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
