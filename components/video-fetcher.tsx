"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function VideoFetcher() {
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const { toast } = useToast()

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/fetch-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch videos")
      }

      setLastFetch(new Date())
      toast({
        title: "Videos Updated",
        description: `Found ${data.videosFound} videos, stored ${data.videosStored} new ones`,
      })
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch videos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Fetch Latest Videos
        </CardTitle>
        <CardDescription>
          Get the latest sports highlights from YouTube based on your preferences. Videos are filtered to avoid score
          spoilers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={fetchVideos} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Fetching Videos...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Fetch New Videos
            </>
          )}
        </Button>

        {lastFetch && (
          <p className="text-sm text-muted-foreground text-center">Last updated: {lastFetch.toLocaleString()}</p>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Searches for recent highlights from your enabled sports</p>
          <p>• Filters out videos with score-related keywords</p>
          <p>• Updates your video library with new content</p>
        </div>
      </CardContent>
    </Card>
  )
}
