import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Link from "next/link"

export default function ResetSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Play className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">SportsHighlights</h1>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Password updated!</CardTitle>
              <CardDescription>Your password has been successfully reset</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Continue to login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
