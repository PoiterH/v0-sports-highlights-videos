interface ContentAnalysis {
  isScoreFree: boolean
  confidence: number
  flaggedTerms: string[]
  reasoning: string
}

export class ContentFilter {
  // Score-related keywords that indicate final results
  private static readonly SCORE_KEYWORDS = [
    // Direct score indicators
    "final score",
    "final result",
    "ends",
    "finished",
    "concluded",
    "victory",
    "defeat",
    "winner",
    "loser",
    "champion",
    "championship game",
    "game over",
    "overtime",
    "sudden death",

    // Score patterns (numbers with common separators)
    /\b\d+[-–—]\d+\b/g, // 3-2, 21-14, etc.
    /\b\d+\s*:\s*\d+\b/g, // 3:2, 21 : 14, etc.
    /\b\d+\s+to\s+\d+\b/gi, // 3 to 2, 21 to 14, etc.

    // Specific result terms
    "beats",
    "defeated",
    "crushed",
    "dominated",
    "upset",
    "blowout",
    "shutout",
    "comeback",
    "rally",
    "lead",
    "behind",
    "ahead",
    "winning",
    "losing",

    // Game state indicators
    "fourth quarter",
    "final quarter",
    "final period",
    "final inning",
    "final set",
    "match point",
    "game point",
    "buzzer beater",
    "walk-off",
    "penalty shootout",

    // Comparative terms
    "vs",
    "versus",
    "against",
    "v.",
    "at",
    "@",

    // Result announcements
    "final",
    "result",
    "score",
    "points",
    "goals",
    "runs",
    "touchdowns",
  ]

  // Keywords that suggest other game references
  private static readonly OTHER_GAME_KEYWORDS = [
    "last week",
    "previous game",
    "earlier today",
    "yesterday",
    "last night",
    "this weekend",
    "playoff",
    "playoffs",
    "tournament",
    "bracket",
    "standings",
    "ranking",
    "season",
    "record",
    "stats",
    "statistics",
  ]

  // Positive keywords that suggest skill/highlight content
  private static readonly POSITIVE_KEYWORDS = [
    "highlights",
    "best plays",
    "amazing",
    "incredible",
    "spectacular",
    "skills",
    "talent",
    "technique",
    "moves",
    "plays",
    "moments",
    "compilation",
    "top 10",
    "best of",
    "greatest",
    "epic",
    "insane",
    "unbelievable",
    "masterclass",
    "clinic",
    "showcase",
  ]

  static analyzeContent(title: string, description: string): ContentAnalysis {
    const content = `${title} ${description}`.toLowerCase()
    const flaggedTerms: string[] = []
    let scoreFlags = 0
    let otherGameFlags = 0
    let positiveFlags = 0

    // Check for score-related content
    for (const keyword of this.SCORE_KEYWORDS) {
      if (keyword instanceof RegExp) {
        const matches = content.match(keyword)
        if (matches) {
          flaggedTerms.push(...matches)
          scoreFlags += matches.length * 2 // Regex matches are weighted higher
        }
      } else if (content.includes(keyword.toLowerCase())) {
        flaggedTerms.push(keyword)
        scoreFlags += 1
      }
    }

    // Check for other game references
    for (const keyword of this.OTHER_GAME_KEYWORDS) {
      if (content.includes(keyword.toLowerCase())) {
        flaggedTerms.push(keyword)
        otherGameFlags += 1
      }
    }

    // Check for positive highlight indicators
    for (const keyword of this.POSITIVE_KEYWORDS) {
      if (content.includes(keyword.toLowerCase())) {
        positiveFlags += 1
      }
    }

    // Calculate confidence and determine if score-free
    const totalFlags = scoreFlags + otherGameFlags
    const positiveScore = positiveFlags * 0.5
    const negativeScore = totalFlags * 1.0

    // Score-free if positive indicators outweigh negative ones
    const isScoreFree = positiveScore > negativeScore && scoreFlags < 3

    // Calculate confidence (0-100)
    let confidence = 50 // Base confidence
    confidence += positiveScore * 10 // Boost for positive keywords
    confidence -= negativeScore * 15 // Penalty for negative keywords
    confidence = Math.max(0, Math.min(100, confidence))

    // Generate reasoning
    let reasoning = ""
    if (isScoreFree) {
      reasoning = `Content appears to be score-free highlights. Found ${positiveFlags} positive indicators`
      if (totalFlags > 0) {
        reasoning += ` and ${totalFlags} potential spoiler terms`
      }
    } else {
      reasoning = `Content may contain spoilers. Found ${scoreFlags} score-related terms`
      if (otherGameFlags > 0) {
        reasoning += ` and ${otherGameFlags} other game references`
      }
    }

    return {
      isScoreFree,
      confidence,
      flaggedTerms: [...new Set(flaggedTerms)], // Remove duplicates
      reasoning,
    }
  }

  // Batch analyze multiple videos
  static analyzeVideos(
    videos: Array<{ title: string; description: string }>,
  ): Array<ContentAnalysis & { index: number }> {
    return videos.map((video, index) => ({
      ...this.analyzeContent(video.title, video.description),
      index,
    }))
  }

  // Filter videos based on analysis
  static filterScoreFreeVideos<T extends { title: string; description: string }>(
    videos: T[],
    minConfidence = 60,
  ): Array<T & { analysis: ContentAnalysis }> {
    return videos
      .map((video) => ({
        ...video,
        analysis: this.analyzeContent(video.title, video.description),
      }))
      .filter((video) => video.analysis.isScoreFree && video.analysis.confidence >= minConfidence)
  }
}
