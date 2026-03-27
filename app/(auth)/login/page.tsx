"use client"

import { useState } from "react"
import { login } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { KeyRound, Mail, Lock, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      const res = await login(formData)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      }
      // If no error, we are redirecting, so keep loading = true
    } catch (err: any) {
      setError(err.message || "Failed to login")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4">
            <KeyRound className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-zinc-400 text-sm text-center">Enter your credentials to access Koenci Dev Dashboard</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm p-3 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="developer@koenci.dev"
                required
                className="pl-10 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="pl-10 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-500 text-black hover:bg-emerald-400 mt-6" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : "Sign In"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-emerald-500 hover:text-emerald-400 hover:underline">
            Register for access
          </Link>
        </p>
      </div>
    </div>
  )
}
