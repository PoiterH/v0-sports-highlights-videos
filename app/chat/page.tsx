import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ChatAssistant from "@/components/chat/chat-assistant";
import { Navigation } from "@/components/navigation";

export default async function ChatPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userEmail={data.user.email} currentPage="chat" />

      <main className="container mx-auto px-4 py-4">
        <div className="h-[calc(100vh-8rem)] rounded-lg border bg-background shadow-sm">
          <ChatAssistant />
        </div>
      </main>
    </div>
  );
}