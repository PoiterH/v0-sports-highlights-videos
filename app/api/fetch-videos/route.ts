import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { YouTubeAPI } from "@/lib/youtube-api"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's enabled sports preferences
    const { data: preferences, error: prefsError } = await supabase
      .from("sports_preferences")
      .select("sport_name")
      .eq("user_id", user.id)
      .eq("enabled", true)

    if (prefsError) {
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ error: "No sports preferences enabled" }, { status: 400 })
    }

    // Initialize YouTube API (you'll need to add YOUTUBE_API_KEY to your environment)
    const youtubeApiKey = process.env.YOUTUBE_API_KEY
    if (!youtubeApiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    const youtube = new YouTubeAPI(youtubeApiKey)
    const allVideos: any[] = []

    // Fetch videos for each enabled sport
    for (const pref of preferences) {
      try {
        const videos = await youtube.searchSportsHighlights(pref.sport_name, 5)

        // Add sport category to each video
        const videosWithSport = videos.map((video) => ({
          ...video,
          sport_category: pref.sport_name,
        }))

        allVideos.push(...videosWithSport)
      } catch (error) {
        console.error(`Error fetching videos for ${pref.sport_name}:`, error)
        // Continue with other sports even if one fails
      }
    }

    // Store videos in database (avoiding duplicates)
    const videosToInsert = allVideos.map((video) => ({
      youtube_id: video.id,
      title: video.title,
      description: video.description,
      thumbnail_url: video.thumbnailUrl,
      channel_name: video.channelName,
      published_at: video.publishedAt,
      sport_category: video.sport_category,
      duration: video.duration,
      view_count: video.viewCount,
      is_score_free: true, // Will be determined by content filtering later
    }))

    if (videosToInsert.length > 0) {
      const { data: insertedVideos, error: insertError } = await supabase
        .from("videos")
        .upsert(videosToInsert, {
          onConflict: "youtube_id",
          ignoreDuplicates: true,
        })
        .select()

      if (insertError) {
        console.error("Error inserting videos:", insertError)
        return NextResponse.json({ error: "Failed to store videos" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        videosFound: allVideos.length,
        videosStored: insertedVideos?.length || 0,
      })
    }

    return NextResponse.json({
      success: true,
      videosFound: 0,
      videosStored: 0,
      message: "No new videos found",
    })
  } catch (error) {
    console.error("Error in fetch-videos API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
