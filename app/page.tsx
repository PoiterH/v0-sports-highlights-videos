import ChatAssistant from "@/components/chat/chat-assistant"

export default function HomePage() {
  // Authentication disabled for testing chat functionality

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Sports Highlights Chat - Debug Mode</h1>
          <p className="text-muted-foreground">Chat interface for testing (authentication disabled)</p>
        </div>

        <div className="h-[calc(100vh-12rem)] rounded-lg border bg-background shadow-sm">
          <ChatAssistant />
        </div>
      </main>
    </div>
  )
}
