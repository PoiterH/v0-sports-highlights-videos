import { SYSTEM_INSTRUCTIONS } from "@/components/agent/prompt";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TavilySearchApi } from "tavily";

// Mock responses for when API is not available
const MOCK_RESPONSES = [
  "I'm a sports highlights assistant! I can help you find and analyze sports content. While I'm currently running in demo mode, I can still chat with you about sports topics.",
  "Great question! In a full deployment, I would search for the latest sports highlights and provide detailed analysis. For now, I'm here to discuss sports with you!",
  "That's an interesting sports topic! While my AI capabilities are currently limited due to API constraints, I'd love to help you explore sports content when fully operational.",
  "Sports highlights are amazing! I'm designed to help you find specific moments, analyze plays, and discuss player statistics. Currently running in demo mode."
];

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_openai_api_key_here") {
      // Return a mock response when API key is not configured
      const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      return NextResponse.json({
        response: randomResponse,
        sources: [],
        toolCalls: [],
      });
    }

    // Convert frontend message format to AI SDK format
    const aiMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Initialize Tavily search (optional - will work without API key in demo mode)
    const tavily = new TavilySearchApi({
      apiKey: process.env.TAVILY_API_KEY || "demo"
    });

    const result = await generateText({
      model: openai("gpt-4o"),
      system: SYSTEM_INSTRUCTIONS,
      messages: aiMessages,
      tools: {
        web_search: {
          description: 'Search the web for current sports information, news, scores, and statistics',
          parameters: z.object({
            query: z.string().describe('Search query for sports information - be specific about what sports data you need'),
          }),
          execute: async ({ query }) => {
            try {
              // If no Tavily API key, return mock search result
              if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY === "demo") {
                return {
                  results: [{
                    title: "Sports Search Demo",
                    content: `Demo search results for: "${query}". In production, this would return real-time sports data from the web. Configure TAVILY_API_KEY environment variable to enable live web search.`,
                    url: "https://example.com/sports-demo"
                  }]
                };
              }

              const searchResult = await tavily.search({
                query: query,
                searchDepth: "basic",
                includeImages: false,
                includeAnswer: true,
                maxResults: 5
              });

              return {
                results: searchResult.results?.map(result => ({
                  title: result.title,
                  content: result.content,
                  url: result.url
                })) || []
              };
            } catch (error) {
              console.error('Web search error:', error);
              return {
                results: [{
                  title: "Search Error",
                  content: `Unable to search for "${query}" at the moment. Please try again later.`,
                  url: ""
                }]
              };
            }
          },
        },
      },
    });

    return NextResponse.json({
      response: result.text,
      sources: result.sources || [],
      toolCalls: result.steps || [],
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle specific OpenAI API errors
    let errorMessage = "Failed to generate response";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("insufficient_quota")) {
        // Return a fallback response for quota issues
        const fallbackResponse = "I'm currently experiencing high demand. Here's what I can tell you: I'm a sports highlights assistant designed to help you find and analyze sports content. While I'm temporarily limited, I'd be happy to discuss sports topics with you!";
        return NextResponse.json({
          response: fallbackResponse,
          sources: [],
          toolCalls: [],
        });
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again in a moment.";
        statusCode = 429;
      } else if (error.message.includes("Invalid API")) {
        errorMessage = "Invalid API configuration. Please contact support.";
        statusCode = 401;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}