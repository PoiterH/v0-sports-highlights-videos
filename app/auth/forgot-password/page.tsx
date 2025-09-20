"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
          ? `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL}/auth/reset-password`
          : `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Play className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">SportsHighlights</h1>
              </div>
              <p className="text-muted-foreground">Score-free sports highlights</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription>Password reset link sent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset
                  your password.
                </p>
                <div className="text-center text-sm">
                  <Link href="/auth/login" className="underline underline-offset-4">
                    Back to login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Play className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">SportsHighlights</h1>
            </div>
            <p className="text-muted-foreground">Score-free sports highlights</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Forgot password</CardTitle>
              <CardDescription>Enter your email to reset your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending reset link..." : "Send reset link"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4">
                    Back to login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
