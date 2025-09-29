import { SYSTEM_INSTRUCTIONS } from "@/components/agent/prompt";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TavilyClient } from "tavily";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Mock responses for when API is not available
const MOCK_RESPONSES = [
  "I'm a sports highlights assistant! I can help you find and analyze sports content. While I'm currently running in demo mode, I can still chat with you about sports topics.",
  "Great question! In a full deployment, I would search for the latest sports highlights and provide detailed analysis. For now, I'm here to discuss sports with you!",
  "That's an interesting sports topic! While my AI capabilities are currently limited due to API constraints, I'd love to help you explore sports content when fully operational.",
  "Sports highlights are amazing! I'm designed to help you find specific moments, analyze plays, and discuss player statistics. Currently running in demo mode."
];

export async function POST(request: NextRequest) {
  try {
    // Authentication disabled for debugging
    // const cookieStore = cookies();
    // const supabase = createServerClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    //   {
    //     cookies: {
    //       getAll() {
    //         return cookieStore.getAll();
    //       },
    //       setAll(cookiesToSet) {
    //         cookiesToSet.forEach(({ name, value, options }) =>
    //           cookieStore.set(name, value, options)
    //         );
    //       },
    //     },
    //   }
    // );

    // const { data: { user }, error: authError } = await supabase.auth.getUser();

    // if (authError || !user) {
    //   return NextResponse.json(
    //     { error: "Authentication required" },
    //     { status: 401 }
    //   );
    // }

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
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));

    // Initialize Tavily search (optional - will work without API key in demo mode)
    const tavily = new TavilyClient({
      apiKey: process.env.TAVILY_API_KEY || "demo"
    });

    const result = await generateText({
      model: openai("gpt-4o"),
      system: SYSTEM_INSTRUCTIONS,
      messages: aiMessages,
      tools: {
        // web_search: {
        //   description: 'Search the web for current sports information, news, scores, and statistics',
        //   inputSchema: z.object({
        //     query: z.string().describe('Search query for sports information - be specific about what sports data you need'),
        //   }),
        //   execute: async ({ query }) => {
        //     try {
        //       // If no Tavily API key, return mock search result
        //       if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY === "demo") {
        //         return {
        //           results: [{
        //             title: "Sports Search Demo",
        //             content: `Demo search results for: "${query}". In production, this would return real-time sports data from the web. Configure TAVILY_API_KEY environment variable to enable live web search.`,
        //             url: "https://example.com/sports-demo"
        //           }]
        //         };
        //       }

        //       const searchResult = await tavily.search({
        //         query: query,
        //         search_depth: "basic",
        //         include_images: false,
        //         include_answer: true,
        //         max_results: 4
        //       });

        //       return {
        //         results: searchResult.results?.map(result => ({
        //           title: result.title,
        //           content: result.content,
        //           url: result.url
        //         })) || []
        //       };
        //     } catch (error) {
        //       console.error('Web search error:', error);
        //       return {
        //         results: [{
        //           title: "Search Error",
        //           content: `Unable to search for "${query}" at the moment. Please try again later.`,
        //           url: ""
        //         }]
        //       };
        //     }
        //   },
        // },
        vectorize_search: {
          description: 'Search your RAG knowledge base for sports highlights, analysis, and stored content',
          inputSchema: z.object({
            question: z.string().describe('Question to search in the RAG knowledge base - be specific about sports content you need'),
            numResults: z.number().optional().describe('Number of results to return (default: 5)'),
            rerank: z.boolean().optional().describe('Whether to rerank results for better relevance (default: true)'),
          }),
          execute: async ({ question, numResults = 5, rerank = true }) => {
            try {
              // Check if Vectorize token is configured
              const vectorizeToken = process.env.VECTORIZE_TOKEN;
              if (!vectorizeToken || vectorizeToken === "demo") {
                return {
                  results: [{
                    title: "RAG Search Demo",
                    content: `Demo RAG search results for: "${question}". In production, this would search your vector knowledge base for stored sports content and analysis. Configure VECTORIZE_TOKEN environment variable to enable RAG search.`,
                    score: 0.95,
                    metadata: { source: "demo" }
                  }]
                };
              }

              // Note: You need to replace these with your actual service-id and pipeline-id
              const serviceId = process.env.VECTORIZE_SERVICE_ID || "your-service-id";
              const pipelineId = process.env.VECTORIZE_PIPELINE_ID || "your-pipeline-id";

              if (serviceId === "your-service-id" || pipelineId === "your-pipeline-id") {
                return {
                  results: [{
                    title: "RAG Configuration Needed",
                    content: `Please configure VECTORIZE_SERVICE_ID and VECTORIZE_PIPELINE_ID environment variables with your Vectorize service and pipeline IDs.`,
                    score: 0.0,
                    metadata: { source: "config-error" }
                  }]
                };
              }


              const vectorizeUrl = `https://api.vectorize.io/v1/org/${serviceId}/pipelines/${pipelineId}/retrieval`;

              const response = await fetch(vectorizeUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${vectorizeToken}`
                },
                body: JSON.stringify({
                  question,
                  numResults,
                  rerank
                })
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('Vectorize API Error Details:', {
                  status: response.status,
                  statusText: response.statusText,
                  errorText,
                  url: vectorizeUrl
                });
                throw new Error(`Vectorize API error: ${response.status} ${response.statusText}. ${errorText}`);
              }

              const data = await response.json();

              // Transform Vectorize response to consistent format
              return {
                results: data.results?.map((result: any) => ({
                  title: result.metadata?.title || result.metadata?.source || "Knowledge Base Result",
                  content: result.content || result.text,
                  score: result.score,
                  metadata: result.metadata
                })) || []
              };
            } catch (error) {
              console.error('Vectorize search error:', error);
              return {
                results: [{
                  title: "RAG Search Error",
                  content: `Unable to search knowledge base for "${question}" at the moment. Please try again later.`,
                  score: 0.0,
                  metadata: { source: error }
                }]
              };
            }
          },
        },
      },
    });

    // Debug logging - log the complete result object
    console.log('=== GENERATE TEXT RESULT ===');
    console.log('Full result object:', JSON.stringify(result, null, 2));
    console.log('Result text:', result.text);
    console.log('Result sources:', result.sources);
    console.log('Result steps:', result.steps);
    console.log('Result toolCalls:', result.toolCalls);
    console.log('Result toolResults:', result.toolResults);
    console.log('=== END DEBUG ===');

    // Extract sources from web search tool results
    const extractedSources: Array<{ url: string; title?: string }> = [];

    // Transform tool steps into the format expected by the frontend
    const transformedToolCalls: Array<{
      type: string;
      state: string;
      input?: string;
      output?: string;
      errorText?: string;
    }> = [];

    if (result.steps && Array.isArray(result.steps)) {
      result.steps.forEach((step: any) => {
        console.log('Processing step:', JSON.stringify(step, null, 2));

        // Look for tool calls in the step content
        if (step.content && Array.isArray(step.content)) {
          step.content.forEach((content: any) => {
            if (content.type === 'tool-call' && (content.toolName === 'web_search' || content.toolName === 'vectorize_search')) {
              console.log('Found tool-call:', content);

              // Find the corresponding tool-result
              const toolResult = step.content.find((c: any) =>
                c.type === 'tool-result' && c.toolCallId === content.toolCallId
              );

              if (toolResult && toolResult.output?.results) {
                console.log('Found tool results:', toolResult.output.results);

                if (content.toolName === 'web_search') {
                  // Extract sources for web search
                  toolResult.output.results.forEach((searchResult: any) => {
                    if (searchResult.url && searchResult.url !== "https://example.com/sports-demo") {
                      extractedSources.push({
                        url: searchResult.url,
                        title: searchResult.title || searchResult.url
                      });
                    }
                  });

                  // Transform for web search tool display
                  const toolCall = {
                    type: "web_search",
                    state: "output-available" as const,
                    input: content.input?.query || JSON.stringify(content.input),
                    output: toolResult.output.results
                      .map((r: any) => `**${r.title}**\n${r.content}\n[${r.url}](${r.url})`)
                      .join('\n\n'),
                  };

                  transformedToolCalls.push(toolCall);
                } else if (content.toolName === 'vectorize_search') {
                  // Transform for vectorize search tool display
                  const toolCall = {
                    type: "vectorize_search",
                    state: "output-available" as const,
                    input: content.input?.question || JSON.stringify(content.input),
                    output: toolResult.output.results
                      .map((r: any) => {
                        const score = r.score ? ` (Score: ${r.score.toFixed(3)})` : '';
                        const metadata = r.metadata ? ` *Source: ${r.metadata.source || 'Knowledge Base'}*` : '';
                        return `**${r.title}**${score}\n${r.content}${metadata}`;
                      })
                      .join('\n\n'),
                  };

                  transformedToolCalls.push(toolCall);
                }
              }
            }
          });
        }
      });
    }

    // If no text response but we have tool results, generate a response
    let responseText = result.text;
    if (!responseText && transformedToolCalls.length > 0) {
      responseText = "I found some information for you. Please see the search results below.";
    }

    const responseData = {
      response: responseText,
      sources: extractedSources,
      toolCalls: transformedToolCalls,
    };

    // Log the final response being sent to client
    console.log('=== FINAL RESPONSE TO CLIENT ===');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('=== END RESPONSE ===');

    return NextResponse.json(responseData);
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