"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Mail, Lock, User, Chrome } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Form states
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                setError(error.message)
                setLoading(false)
            } else {
                router.push("/")
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        hashed_password: hashedPassword,
                    },
                },
            })

            if (signUpError) {
                setError(signUpError.message)
                setLoading(false)
            } else if (data.user) {
                alert("Check your email for the confirmation link!")
                setIsLogin(true)
                setLoading(false)
            }
        }
    }

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="min-h-screen bg-[#0f1116] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-[#1c1f26] rounded-[32px] p-8 border border-[#2a2e37] shadow-2xl relative overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#f7b924] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(247,185,36,0.2)]">
                        <Sparkles className="w-8 h-8 text-[#12141a]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#f7b924] tracking-tight mb-2">ColorBet</h1>
                    <p className="text-[#8a8f98] text-center text-sm px-4">
                        Predict the winning color and multiply your winnings!
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-[#12141a] p-1.5 rounded-2xl mb-8 border border-[#2a2e37]">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={cn(
                            "flex-1 py-3 text-sm font-bold rounded-[14px] transition-all duration-300",
                            isLogin ? "bg-[#1c1f26] text-white shadow-xl" : "text-[#4a505e] hover:text-[#8a8f98]"
                        )}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={cn(
                            "flex-1 py-3 text-sm font-bold rounded-[14px] transition-all duration-300",
                            !isLogin ? "bg-[#1c1f26] text-white shadow-xl" : "text-[#4a505e] hover:text-[#8a8f98]"
                        )}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Bonus Banner (Only on Sign Up) */}
                {!isLogin && (
                    <div className="bg-[#f7b924]/10 border border-[#f7b924]/20 rounded-xl p-3.5 flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-[#f7b924]" />
                        </div>
                        <p className="text-[#f7b924] text-sm font-medium">
                            Get ₹100 bonus on signup!
                        </p>
                    </div>
                )}

                {/* Form Section */}
                <form onSubmit={handleAuth} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2.5 px-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#8a8f98] ml-1 uppercase tracking-widest">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-[#4a505e] group-focus-within:text-[#f7b924] transition-colors" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    className="bg-[#12141a]/50 border-[#2a2e37] text-white pl-11 h-14 rounded-2xl focus:border-[#f7b924] focus:ring-0 transition-all placeholder:text-[#4a505e] text-base"
                                    required={!isLogin}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#8a8f98] ml-1 uppercase tracking-widest">Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-[#4a505e] group-focus-within:text-[#f7b924] transition-colors" />
                            </div>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                className="bg-[#12141a]/50 border-[#2a2e37] text-white pl-11 h-14 rounded-2xl focus:border-[#f7b924] focus:ring-0 transition-all placeholder:text-[#4a505e] text-base"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-[#8a8f98] uppercase tracking-widest">Password</label>
                            {isLogin && (
                                <button type="button" className="text-[10px] text-[#f7b924] hover:underline uppercase tracking-widest font-extrabold">
                                    Forgot?
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-[#4a505e] group-focus-within:text-[#f7b924] transition-colors" />
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-[#12141a]/50 border-[#2a2e37] text-white pl-11 h-14 rounded-2xl focus:border-[#f7b924] focus:ring-0 transition-all placeholder:text-[#4a505e] text-base"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f7b924] hover:bg-[#ffc845] text-[#12141a] font-extrabold h-14 rounded-2xl mt-4 shadow-xl shadow-[#f7b924]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? (
                            "Please wait..."
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                {isLogin ? "Sign In" : "Create Account"}
                            </>
                        )}
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#2a2e37]"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-[#4a505e]">
                            <span className="bg-[#1c1f26] px-3 text-[#4a505e]">Social Login</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-transparent border-[#2a2e37] text-white hover:bg-[#12141a] h-14 rounded-2xl group transition-all font-bold"
                    >
                        <Chrome className="w-5 h-5 mr-2 text-[#4a505e] group-hover:text-white transition-colors" />
                        Google
                    </Button>
                </form>
            </div>

            <p className="mt-8 text-[10px] text-[#4a505e] font-bold uppercase tracking-[0.2em]">
                © 2026 ColorBet Gaming. All rights reserved.
            </p>
        </div>
    )
}
