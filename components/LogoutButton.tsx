"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <Button onClick={handleLogout} variant="destructive">
            Logout
        </Button>
    )
}
