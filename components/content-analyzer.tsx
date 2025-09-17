"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalysisResult {
  analyzed: number
  failed: number
  scoreFreeVideos: number
}

export function ContentAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null)
  const { toast } = useToast()

  const analyzeContent = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze content")
      }

      setLastAnalysis({
        analyzed: data.analyzed,
        failed: data.failed || 0,
        scoreFreeVideos: data.scoreFreeVideos,
      })

      toast({
        title: "Content Analysis Complete",
        description: `Analyzed ${data.analyzed} videos, found ${data.scoreFreeVideos} score-free highlights`,
      })
    } catch (error) {
      console.error("Error analyzing content:", error)
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze content",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Content Analysis
        </CardTitle>
        <CardDescription>
          Analyze video content to identify score-free highlights. This filters out videos that mention final scores or
          game results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={analyzeContent} disabled={analyzing} className="w-full">
          {analyzing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-pulse" />
              Analyzing Content...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Analyze Videos
            </>
          )}
        </Button>

        {analyzing && (
          <div className="space-y-2">
            <Progress value={undefined} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">Processing video content...</p>
          </div>
        )}

        {lastAnalysis && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium">Last Analysis Results</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  <strong>{lastAnalysis.analyzed}</strong> analyzed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {lastAnalysis.scoreFreeVideos} score-free
                </Badge>
              </div>
              {lastAnalysis.failed > 0 && (
                <div className="flex items-center gap-2 col-span-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    <strong>{lastAnalysis.failed}</strong> failed to process
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Scans video titles and descriptions for score-related keywords</p>
          <p>• Identifies references to other games and final results</p>
          <p>• Prioritizes skill-focused highlight content</p>
          <p>• Updates video database with analysis results</p>
        </div>
      </CardContent>
    </Card>
  )
}
