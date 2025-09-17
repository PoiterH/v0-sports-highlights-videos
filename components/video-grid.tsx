"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { YouTubeAPI } from "@/lib/youtube-api"
import { Play, Clock, Eye, Search, Filter, Heart, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Video {
  id: string
  youtube_id: string
  title: string
  description: string
  thumbnail_url: string
  channel_name: string
  published_at: string
  sport_category: string
  duration: string
  view_count: number
  is_score_free: boolean
  content_analysis?: {
    confidence: number
    reasoning: string
  }
}

interface VideoInteraction {
  video_id: string
  watched: boolean
  liked: boolean
  hidden: boolean
}

export function VideoGrid() {
  const [videos, setVideos] = useState<Video[]>([])
  const [interactions, setInteractions] = useState<VideoInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [sports, setSports] = useState<string[]>([])
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadVideos()
    loadUserInteractions()
  }, [])

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("is_score_free", true)
        .order("published_at", { ascending: false })
        .limit(50)

      if (error) throw error

      setVideos(data || [])

      // Extract unique sports for filter
      const uniqueSports = [...new Set(data?.map((v) => v.sport_category) || [])]
      setSports(uniqueSports)
    } catch (error) {
      console.error("Error loading videos:", error)
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserInteractions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("user_video_interactions").select("*").eq("user_id", user.id)

      if (error) throw error
      setInteractions(data || [])
    } catch (error) {
      console.error("Error loading interactions:", error)
    }
  }

  const updateInteraction = async (videoId: string, field: keyof VideoInteraction, value: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("user_video_interactions").upsert(
        {
          user_id: user.id,
          video_id: videoId,
          [field]: value,
        },
        {
          onConflict: "user_id,video_id",
        },
      )

      if (error) throw error

      // Update local state
      setInteractions((prev) => {
        const existing = prev.find((i) => i.video_id === videoId)
        if (existing) {
          return prev.map((i) => (i.video_id === videoId ? { ...i, [field]: value } : i))
        } else {
          return [...prev, { video_id: videoId, watched: false, liked: false, hidden: false, [field]: value }]
        }
      })

      toast({
        title: field === "liked" ? (value ? "Liked" : "Unliked") : field === "hidden" ? "Hidden" : "Updated",
        description: `Video ${field === "liked" ? (value ? "added to" : "removed from") + " favorites" : field === "hidden" ? "hidden from view" : "updated"}`,
      })
    } catch (error) {
      console.error("Error updating interaction:", error)
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      })
    }
  }

  const getInteraction = (videoId: string): VideoInteraction => {
    return (
      interactions.find((i) => i.video_id === videoId) || {
        video_id: videoId,
        watched: false,
        liked: false,
        hidden: false,
      }
    )
  }

  const openVideo = (video: Video) => {
    // Mark as watched
    updateInteraction(video.id, "watched", true)
    // Open YouTube video in new tab
    window.open(`https://www.youtube.com/watch?v=${video.youtube_id}`, "_blank")
  }

  const filteredVideos = videos
    .filter((video) => {
      const interaction = getInteraction(video.id)
      if (interaction.hidden) return false

      if (selectedSport !== "all" && video.sport_category !== selectedSport) return false

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          (video.title || "").toLowerCase().includes(searchLower) ||
          (video.channel_name || "").toLowerCase().includes(searchLower) ||
          (video.sport_category || "").toLowerCase().includes(searchLower)
        )
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        case "popular":
          return b.view_count - a.view_count
        case "duration":
          return a.duration.localeCompare(b.duration)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search videos, channels, or sports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {sports.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredVideos.length} score-free highlights found
        {selectedSport !== "all" && ` in ${selectedSport}`}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => {
          const interaction = getInteraction(video.id)
          return (
            <Card
              key={video.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail_url || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary/90 hover:bg-primary"
                    onClick={() => openVideo(video)}
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Watch
                  </Button>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {YouTubeAPI.formatDuration(video.duration || "0")}
                  </Badge>
                  {interaction.watched && (
                    <Badge variant="secondary" className="text-xs bg-primary/90 text-white">
                      Watched
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge variant="outline" className="text-xs bg-white/90 text-primary border-primary/20">
                    {video.sport_category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-balance">{video.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span className="truncate">{video.channel_name || "Unknown Channel"}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {YouTubeAPI.formatViewCount(video.view_count)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(video.published_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateInteraction(video.id, "liked", !interaction.liked)
                      }}
                      className={`h-8 w-8 p-0 ${interaction.liked ? "text-red-500" : "text-muted-foreground"}`}
                    >
                      <Heart className={`h-4 w-4 ${interaction.liked ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateInteraction(video.id, "hidden", true)
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredVideos.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No videos found</h3>
            <p>Try adjusting your search or filters, or fetch new videos from YouTube.</p>
          </div>
        </div>
      )}
    </div>
  )
}
