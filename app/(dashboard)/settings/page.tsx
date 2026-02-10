"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getProfile, updateProfile } from "@/app/actions/profile"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null)

    useEffect(() => {
        async function fetchProfile() {
            const result = await getProfile()
            if (result.data) {
                setProfile({
                    full_name: result.data.full_name || "",
                    email: result.data.email || ""
                })
            } else if (result.error) {
                toast.error(result.error)
            }
            setIsLoading(false)
        }
        fetchProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        setIsSaving(true)
        const result = await updateProfile(profile)
        setIsSaving(false)

        if (result.success) {
            toast.success("Profile updated successfully")
            if (result.data?.new_email) {
                toast.info("Please check your new email address for a verification link to complete the email change.")
            }
        } else {
            toast.error(result.error || "Failed to update profile")
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

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
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    value={profile?.full_name}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile?.email}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                                    placeholder="your@email.com"
                                />
                            </div>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
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
                            <div className="text-sm">Enabled</div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Theme</Label>
                                <div className="text-sm text-muted-foreground">Customize the look and feel.</div>
                            </div>
                            <div className="text-sm">System</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
