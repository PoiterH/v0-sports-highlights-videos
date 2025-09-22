"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, Settings, Home, LogOut, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface NavigationProps {
  userEmail?: string
  currentPage?: "home" | "preferences" | "chat"
}

export function Navigation({ userEmail, currentPage = "home" }: NavigationProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="h-8 w-8 text-primary" />
          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            SportsHighlights
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {currentPage !== "home" && (
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          )}

          {currentPage !== "chat" && (
            <Link href="/chat">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat Assistant
              </Button>
            </Link>
          )}

          {currentPage !== "preferences" && (
            <Link href="/preferences">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Sports Preferences
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-3">
            {userEmail && <div className="text-sm text-muted-foreground">Welcome, {userEmail}</div>}
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
