import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContentFilter } from "@/lib/content-filter"

export async function POST() {
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

    // Get all videos that haven't been analyzed yet
    const { data: videos, error: videosError } = await supabase
      .from("videos")
      .select("id, youtube_id, title, description, is_score_free, content_analysis")
      .is("content_analysis", null)
      .limit(50) // Process in batches

    if (videosError) {
      return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
    }

    if (!videos || videos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No videos to analyze",
        analyzed: 0,
      })
    }

    // Analyze content for each video
    const updates = videos.map((video) => {
      const analysis = ContentFilter.analyzeContent(video.title, video.description || "")

      return {
        id: video.id,
        is_score_free: analysis.isScoreFree,
        content_analysis: {
          confidence: analysis.confidence,
          flagged_terms: analysis.flaggedTerms,
          reasoning: analysis.reasoning,
          analyzed_at: new Date().toISOString(),
        },
      }
    })

    // Update videos with analysis results
    const updatePromises = updates.map((update) =>
      supabase
        .from("videos")
        .update({
          is_score_free: update.is_score_free,
          content_analysis: update.content_analysis,
        })
        .eq("id", update.id),
    )

    const results = await Promise.allSettled(updatePromises)
    const successful = results.filter((result) => result.status === "fulfilled").length
    const failed = results.filter((result) => result.status === "rejected").length

    if (failed > 0) {
      console.error(`Failed to update ${failed} videos`)
    }

    return NextResponse.json({
      success: true,
      analyzed: successful,
      failed,
      scoreFreeVideos: updates.filter((u) => u.is_score_free).length,
    })
  } catch (error) {
    console.error("Error in analyze-content API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
