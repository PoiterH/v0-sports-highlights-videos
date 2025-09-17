interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  channelName: string
  publishedAt: string
  duration: string
  viewCount: number
}

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string }
    snippet: {
      title: string
      description: string
      thumbnails: {
        high: { url: string }
      }
      channelTitle: string
      publishedAt: string
    }
  }>
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    contentDetails: {
      duration: string
    }
    statistics: {
      viewCount: string
    }
  }>
}

export class YouTubeAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async searchSportsHighlights(sport: string, maxResults = 10): Promise<YouTubeVideo[]> {
    try {
      // Search for recent sports highlights with score-free keywords
      const searchQuery = `${sport} highlights skills plays amazing moments -score -final -result -vs -defeat -win -loss`

      const searchUrl =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `type=video&` +
        `order=date&` +
        `publishedAfter=${this.getRecentDate()}&` +
        `maxResults=${maxResults}&` +
        `key=${this.apiKey}`

      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) {
        throw new Error(`YouTube API search failed: ${searchResponse.status}`)
      }

      const searchData: YouTubeSearchResponse = await searchResponse.json()

      if (!searchData.items || searchData.items.length === 0) {
        return []
      }

      // Get video IDs for details request
      const videoIds = searchData.items.map((item) => item.id.videoId).join(",")

      // Get video details (duration, view count)
      const detailsUrl =
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=contentDetails,statistics&` +
        `id=${videoIds}&` +
        `key=${this.apiKey}`

      const detailsResponse = await fetch(detailsUrl)
      if (!detailsResponse.ok) {
        throw new Error(`YouTube API details failed: ${detailsResponse.status}`)
      }

      const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json()

      // Combine search results with details
      const videos: YouTubeVideo[] = searchData.items.map((item, index) => {
        const details = detailsData.items[index]
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.high.url,
          channelName: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: YouTubeAPI.formatDuration(details?.contentDetails.duration || null) || "PT0S",
          viewCount: Number.parseInt(details?.statistics.viewCount || "0"),
        }
      })

      return videos
    } catch (error) {
      console.error("Error fetching YouTube videos:", error)
      throw error
    }
  }

  private getRecentDate(): string {
    // Get videos from the last 12 hours
    const date = new Date()
    date.setHours(date.getHours() - 12)
    return date.toISOString()
  }

  // Convert YouTube duration format (PT4M13S) to readable format
  static formatDuration(duration: string | null): string {
    if (!duration) return "0:00"

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "0:00"

    const hours = Number.parseInt(match[1] || "0")
    const minutes = Number.parseInt(match[2] || "0")
    const seconds = Number.parseInt(match[3] || "0")

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Format view count to readable format
  static formatViewCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`
    }
    return `${count} views`
  }
}
