"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SportPreference {
  id: string
  sport_name: string
  enabled: boolean
}

const DEFAULT_SPORTS = [
  "Basketball",
  "Football",
  "Soccer",
  "Baseball",
  "Hockey",
  "Tennis",
  "Golf",
  "Boxing",
  "MMA",
  "Cricket",
]

export function SportsPreferences() {
  const [preferences, setPreferences] = useState<SportPreference[]>([])
  const [newSport, setNewSport] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("sports_preferences")
        .select("*")
        .eq("user_id", user.id)
        .order("sport_name")

      if (error) throw error

      // If no preferences exist, create defaults
      if (!data || data.length === 0) {
        await createDefaultPreferences(user.id)
        return
      }

      setPreferences(data)
    } catch (error) {
      console.error("Error loading preferences:", error)
      toast({
        title: "Error",
        description: "Failed to load sports preferences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const createDefaultPreferences = useCallback(async (userId: string) => {
    try {
      const defaultPrefs = DEFAULT_SPORTS.map((sport) => ({
        user_id: userId,
        sport_name: sport,
        enabled: true,
      }))

      const { data, error } = await supabase.from("sports_preferences").insert(defaultPrefs).select()

      if (error) throw error
      setPreferences(data)
    } catch (error) {
      console.error("Error creating default preferences:", error)
    }
  }, [supabase])

  const toggleSport = async (id: string, enabled: boolean) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("sports_preferences")
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setPreferences((prev) => prev.map((pref) => (pref.id === id ? { ...pref, enabled } : pref)))

      toast({
        title: "Updated",
        description: `Sport preference ${enabled ? "enabled" : "disabled"}`,
      })
    } catch (error) {
      console.error("Error updating preference:", error)
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addSport = async () => {
    if (!newSport.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Check if sport already exists
    const exists = preferences.some((pref) => pref.sport_name.toLowerCase() === newSport.trim().toLowerCase())

    if (exists) {
      toast({
        title: "Sport already exists",
        description: "This sport is already in your preferences",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from("sports_preferences")
        .insert({
          user_id: user.id,
          sport_name: newSport.trim(),
          enabled: true,
        })
        .select()
        .single()

      if (error) throw error

      setPreferences((prev) => [...prev, data].sort((a, b) => a.sport_name.localeCompare(b.sport_name)))
      setNewSport("")

      toast({
        title: "Sport added",
        description: `${newSport.trim()} has been added to your preferences`,
      })
    } catch (error) {
      console.error("Error adding sport:", error)
      toast({
        title: "Error",
        description: "Failed to add sport",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const removeSport = async (id: string, sportName: string) => {
    setSaving(true)
    try {
      const { error } = await supabase.from("sports_preferences").delete().eq("id", id)

      if (error) throw error

      setPreferences((prev) => prev.filter((pref) => pref.id !== id))

      toast({
        title: "Sport removed",
        description: `${sportName} has been removed from your preferences`,
      })
    } catch (error) {
      console.error("Error removing sport:", error)
      toast({
        title: "Error",
        description: "Failed to remove sport",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sports Preferences</CardTitle>
          <CardDescription>Loading your sports preferences...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sports Preferences</CardTitle>
        <CardDescription>
          Select which sports you want to see highlights for. Videos will be filtered to only show content from your
          selected sports.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new sport */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-sport" className="sr-only">
              Add new sport
            </Label>
            <Input
              id="new-sport"
              placeholder="Add a new sport..."
              value={newSport}
              onChange={(e) => setNewSport(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSport()}
            />
          </div>
          <Button onClick={addSport} disabled={!newSport.trim() || saving}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Sports list */}
        <div className="space-y-3">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={(enabled) => toggleSport(pref.id, enabled)}
                  disabled={saving}
                />
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pref.sport_name}</span>
                  {pref.enabled && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSport(pref.id, pref.sport_name)}
                disabled={saving}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {preferences.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No sports preferences found.</p>
            <p className="text-sm">Add a sport above to get started.</p>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Enabled sports:</strong> {preferences.filter((p) => p.enabled).length} of {preferences.length}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
