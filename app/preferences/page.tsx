import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SportsPreferences } from "@/components/sports-preferences"
import { Navigation } from "@/components/navigation"

export default async function PreferencesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userEmail={data.user.email} currentPage="preferences" />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Sports Preferences</h1>
            <p className="text-muted-foreground mt-2">
              Customize which sports you want to see highlights for. Only videos from your selected sports will be
              shown.
            </p>
          </div>
          <SportsPreferences />
        </div>
      </main>
    </div>
  )
}
