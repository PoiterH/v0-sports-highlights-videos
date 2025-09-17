import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VideoGrid } from "@/components/video-grid"
import { VideoFetcher } from "@/components/video-fetcher"
import { ContentAnalyzer } from "@/components/content-analyzer"
import { Navigation } from "@/components/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation userEmail={data.user.email} currentPage="home" />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-balance">Score-Free Sports Highlights</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Watch the best sports moments without spoilers. Our AI filters out final scores and game results so you
              can enjoy pure highlights.
            </p>
          </div>

          {/* Management Tools */}
          <div className="grid md:grid-cols-2 gap-6">
            <VideoFetcher />
            <ContentAnalyzer />
          </div>

          {/* Video Grid */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Latest Highlights</h3>
            <VideoGrid />
          </div>
        </div>
      </main>
    </div>
  )
}
