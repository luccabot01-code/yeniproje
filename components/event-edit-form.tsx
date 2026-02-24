"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event, UpdateEventInput, ItineraryItem, OurStoryItem, MenuOption } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, Clock, Plus, Trash2, ArrowUp, ArrowDown, Heart, UtensilsCrossed, Music, Car } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface EventEditFormProps {
  event: Event
  onSuccess?: (updatedEvent?: Event) => void
}

export function EventEditForm({ event, onSuccess }: EventEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(event.cover_image_url || null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(event.cover_image_url || null)
  const [mediaType, setMediaType] = useState<string>(event.media_type || "image")

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    return dateString.replace(" ", "T").slice(0, 16)
  }

  const [formData, setFormData] = useState<UpdateEventInput>({
    event_type: event.event_type,
    title: event.title,
    date: formatDateForInput(event.date),
    location: event.location,
    location_url: event.location_url || "",
    dress_code: event.dress_code || "",
    program_notes: event.program_notes || "",
    allow_plusone: event.allow_plusone,
    custom_attendance_options: event.custom_attendance_options,
    theme_color: event.theme_color,
    theme_style: event.theme_style || "minimalist",
    host_email: event.host_email,
    registry_url: event.registry_url || "",
        itinerary: event.itinerary || [],
        show_countdown: event.show_countdown ?? false,
        show_itinerary: event.show_itinerary ?? true,
        show_our_story: event.show_our_story ?? true,
        show_menu: event.show_menu ?? true,
      show_song_request: event.show_song_request ?? true,
      show_travel_lodging: event.show_travel_lodging ?? true,
      show_wedding_details: event.show_wedding_details ?? true,
      our_story: event.our_story || [],
      menu_options_jsonb: event.menu_options_jsonb || [],
  })

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    if (file.size > 10 * 1024 * 1024) {
      setError("Story image must be less than 10MB")
      return
    }
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop() || "jpg"
      const fileName = `story/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { data, error: uploadErr } = await supabase.storage
        .from("event-media")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })
      if (uploadErr) throw new Error(uploadErr.message)
      const { data: { publicUrl } } = supabase.storage.from("event-media").getPublicUrl(data.path)
      const newStory = [...(formData.our_story || [])]
      newStory[index] = { ...newStory[index], image_url: publicUrl }
      setFormData({ ...formData, our_story: newStory })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload story image")
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")

    if (!isImage && !isVideo) {
      setError("Please select an image or video file")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File must be less than 50MB")
      return
    }

    setIsUploading(true)
    setError(null)

      try {
        if (isImage) {
          const reader = new FileReader()
          reader.onloadend = () => setPhotoPreview(reader.result as string)
          reader.readAsDataURL(file)
        } else {
          const objectUrl = URL.createObjectURL(file)
          setPhotoPreview(prev => {
            if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev)
            return objectUrl
          })
        }

      setMediaType(isVideo ? "video" : "image")

      const supabase = createClient()
      const ext = file.name.split(".").pop() || "bin"
      const prefix = isVideo ? "videos" : "photos"
      const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { data, error } = await supabase.storage
        .from("event-media")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })

      if (error) throw new Error(error.message || "Upload failed")

      const { data: { publicUrl } } = supabase.storage.from("event-media").getPublicUrl(data.path)
      setPhotoUrl(publicUrl)
      setMediaType(isVideo ? "video" : "image")
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
      setPhotoPreview(event.cover_image_url || null)
      setPhotoUrl(event.cover_image_url || null)
      setMediaType(event.media_type || "image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    setPhotoUrl(null)
    setMediaType("image")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Guard against double-submit
    if (isLoading) return

    setIsLoading(true)
    setError(null)

      try {
        const updateData: UpdateEventInput = {
          ...formData,
          date: formData.date ? formData.date.replace("T", " ") + ":00" : "",
        theme_style: formData.theme_style,
        cover_image_url: photoUrl || undefined,
        media_type: photoUrl ? mediaType : undefined,
        registry_url: formData.registry_url || undefined,
        location_url: formData.location_url || undefined,
            itinerary: formData.itinerary?.filter((item: ItineraryItem) => item.time || item.title) || [],
            show_countdown: formData.show_countdown,
            show_itinerary: formData.show_itinerary,
            show_our_story: formData.show_our_story,
            show_menu: formData.show_menu,
            show_song_request: formData.show_song_request,
            show_travel_lodging: formData.show_travel_lodging,
            show_wedding_details: formData.show_wedding_details,
          our_story: formData.our_story?.filter((item: OurStoryItem) => item.title || item.description || item.image_url) || [],
          menu_options_jsonb: formData.menu_options_jsonb?.filter((item: MenuOption) => item.title) || [],
      }

      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const err = await response.json()
          throw new Error(err.error || "Failed to update wedding")
      }

      const data = await response.json()
      if (onSuccess) onSuccess(data as Event)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update wedding")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">

          {/* Wedding Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Wedding Title</Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Sarah & John's Wedding"
            className="bg-secondary"
          />
        </div>

        {/* Photo / Video */}
        <div className="space-y-2">
            <Label htmlFor="photo">Upload Wedding Photo or Video</Label>
          {!photoPreview ? (
            <div className="relative">
              <Input
                id="photo"
                type="file"
                accept="image/*,video/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Label
                htmlFor="photo"
                className="flex items-center justify-center gap-2 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click to upload photo or video</span>
                    <span className="text-xs">Max 50MB</span>
                  </div>
                )}
              </Label>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border">
              {mediaType === "video" ? (
                <video
                  src={photoPreview}
                  className="w-full h-auto object-contain max-h-96 bg-muted"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={photoPreview || "/placeholder.svg"}
                    alt="Wedding cover preview"
                  className="w-full h-auto object-contain max-h-96 bg-muted"
                />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemovePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="space-y-2">
          <Label htmlFor="date">Date & Time</Label>
          <Input
            id="date"
            type="datetime-local"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="bg-secondary"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Grand Hotel Ballroom, 123 Main St"
            className="bg-secondary"
          />
        </div>

        {/* Location URL */}
        <div className="space-y-2">
            <Label htmlFor="location_url">Location URL</Label>
          <Input
            id="location_url"
            type="url"
            value={formData.location_url}
            onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="bg-secondary"
            style={{ wordBreak: "break-all" }}
          />
        </div>

        {/* Registry URL */}
        <div className="space-y-2">
            <Label htmlFor="registry_url">Gift Registry or Fund URL</Label>
          <Input
            id="registry_url"
            type="url"
            value={formData.registry_url || ""}
            onChange={(e) => setFormData({ ...formData, registry_url: e.target.value })}
            placeholder="e.g., https://www.zola.com/registry/..."
            className="bg-secondary"
            style={{ wordBreak: "break-all" }}
          />
        </div>

        {/* Dress Code */}
        <div className="space-y-2">
            <Label htmlFor="dress_code">Dress Code</Label>
          <Input
            id="dress_code"
            value={formData.dress_code}
            onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
            placeholder="Formal / Black Tie / Casual"
            className="bg-secondary"
          />
        </div>

        {/* Program Notes */}
        <div className="space-y-2">
            <Label htmlFor="program_notes">Program / Notes</Label>
          <Textarea
            id="program_notes"
            value={formData.program_notes}
            onChange={(e) => setFormData({ ...formData, program_notes: e.target.value })}
            placeholder="Ceremony starts at 4 PM, followed by cocktail hour..."
            rows={4}
            className="bg-secondary resize-none"
            style={{ wordBreak: "break-all", overflowWrap: "anywhere" }}
          />
        </div>

          {/* Event Itinerary */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                    Wedding Day Itinerary
                </Label>
                <p className="text-sm text-muted-foreground mt-1">Add a timeline of activities for your guests</p>
              </div>
              <Switch
                id="show_itinerary_edit"
                checked={formData.show_itinerary ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, show_itinerary: checked })}
              />
            </div>
          {(formData.itinerary || []).map((item: ItineraryItem, index: number) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-border bg-secondary/30"
            >
              <div className="flex-shrink-0 w-full sm:w-28">
                <Label className="text-xs text-muted-foreground mb-1 block">Time</Label>
                <Input
                  value={item.time}
                  onChange={(e) => {
                    const updated = [...(formData.itinerary || [])]
                    updated[index] = { ...updated[index], time: e.target.value }
                    setFormData({ ...formData, itinerary: updated })
                  }}
                  placeholder="6:00 PM"
                  className="bg-secondary"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => {
                    const updated = [...(formData.itinerary || [])]
                    updated[index] = { ...updated[index], title: e.target.value }
                    setFormData({ ...formData, itinerary: updated })
                  }}
                  placeholder="Cocktail Hour"
                  className="bg-secondary"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                <div className="flex gap-2">
                  <Input
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...(formData.itinerary || [])]
                      updated[index] = { ...updated[index], description: e.target.value }
                      setFormData({ ...formData, itinerary: updated })
                    }}
                    placeholder="Optional details..."
                    className="bg-secondary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      const updated = (formData.itinerary || []).filter((_: ItineraryItem, i: number) => i !== index)
                      setFormData({ ...formData, itinerary: updated })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={() => {
              const updated = [...(formData.itinerary || []), { time: "", title: "", description: "" }]
              setFormData({ ...formData, itinerary: updated })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Timeline Item
          </Button>
        </div>

          {/* Menu Options */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                    Menu Options
                </Label>
                <p className="text-sm text-muted-foreground mt-1">Add custom menu choices for your guests to select when they RSVP</p>
              </div>
              <Switch
                id="show_menu_edit"
                checked={formData.show_menu ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, show_menu: checked })}
              />
            </div>
          {(formData.menu_options_jsonb || []).map((item: MenuOption, index: number) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground tracking-wide">Option {index + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (formData.menu_options_jsonb || []).filter((_: MenuOption, i: number) => i !== index)
                    setFormData({ ...formData, menu_options_jsonb: updated })
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1 transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Menu Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => {
                    const updated = [...(formData.menu_options_jsonb || [])]
                    updated[index] = { ...updated[index], title: e.target.value }
                    setFormData({ ...formData, menu_options_jsonb: updated })
                  }}
                  placeholder="e.g., Chicken, Vegan, Fish"
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Description / Contents</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...(formData.menu_options_jsonb || [])]
                    updated[index] = { ...updated[index], description: e.target.value }
                    setFormData({ ...formData, menu_options_jsonb: updated })
                  }}
                  placeholder="e.g., Roasted chicken breast with seasonal vegetables and herb potatoes"
                  rows={2}
                  className="bg-secondary resize-none"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={() => {
              const updated = [...(formData.menu_options_jsonb || []), { id: `menu_${Date.now()}`, title: "", description: "" }]
              setFormData({ ...formData, menu_options_jsonb: updated })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Option
          </Button>
        </div>

        {/* Countdown */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="show_countdown_edit" className="text-base font-medium cursor-pointer">
                  Show Wedding Countdown
              </Label>
              <p className="text-sm text-muted-foreground">
                Display a beautiful, animated countdown to the Big Day on the public RSVP page.
              </p>
            </div>
            <Switch
              id="show_countdown_edit"
              checked={formData.show_countdown ?? false}
              onCheckedChange={(checked) => setFormData({ ...formData, show_countdown: checked })}
            />
          </div>
        </div>

        {/* Wedding Details */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="show_wedding_details_edit" className="text-base font-medium cursor-pointer">
                Show Wedding Details
              </Label>
              <p className="text-sm text-muted-foreground">
                Show the date, location, registry, dress code and notes card on the RSVP page.
              </p>
            </div>
            <Switch
              id="show_wedding_details_edit"
              checked={formData.show_wedding_details ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, show_wedding_details: checked })}
            />
          </div>
        </div>

        {/* Song Request */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <Music className="h-4 w-4" />
                Song Request
              </Label>
              <p className="text-sm text-muted-foreground mt-1">Ask guests what song will get them on the dance floor</p>
            </div>
            <Switch
              id="show_song_request_edit"
              checked={formData.show_song_request ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, show_song_request: checked })}
            />
          </div>
        </div>

        {/* Travel & Lodging */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <Car className="h-4 w-4" />
                Travel & Lodging
              </Label>
              <p className="text-sm text-muted-foreground mt-1">Ask guests about shuttle and hotel needs in the RSVP form</p>
            </div>
            <Switch
              id="show_travel_lodging_edit"
              checked={formData.show_travel_lodging ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, show_travel_lodging: checked })}
            />
          </div>
        </div>

          {/* Our Story */}
          <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                      Manage Our Story
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">Share your love story with your guests on the RSVP page</p>
                </div>
                <Switch
                  id="show_our_story_edit"
                  checked={formData.show_our_story ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_our_story: checked })}
                />
              </div>
            {(formData.our_story || []).map((item: OurStoryItem, index: number) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Story #{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === 0}
                      onClick={() => {
                        const updated = [...(formData.our_story || [])]
                        ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
                        setFormData({ ...formData, our_story: updated })
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === (formData.our_story || []).length - 1}
                      onClick={() => {
                        const updated = [...(formData.our_story || [])]
                        ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
                        setFormData({ ...formData, our_story: updated })
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        const updated = (formData.our_story || []).filter((_: OurStoryItem, i: number) => i !== index)
                        setFormData({ ...formData, our_story: updated })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Image</Label>
                  {item.image_url ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                      <img src={item.image_url} alt={item.title || "Story image"} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(formData.our_story || [])]
                          updated[index] = { ...updated[index], image_url: "" }
                          setFormData({ ...formData, our_story: updated })
                        }}
                        className="absolute top-1 right-1 rounded-md px-2 py-1 text-xs bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id={`edit-story-image-${index}`}
                        className="hidden"
                        onChange={(e) => handleStoryImageUpload(e, index)}
                      />
                      <div
                        onClick={() => document.getElementById(`edit-story-image-${index}`)?.click()}
                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted transition-colors"
                      >
                        <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Click to upload</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Date</Label>
                  <Input
                    value={item.date || ""}
                    onChange={(e) => {
                      const updated = [...(formData.our_story || [])]
                      updated[index] = { ...updated[index], date: e.target.value }
                      setFormData({ ...formData, our_story: updated })
                    }}
                    placeholder="e.g., March 2021"
                    className="bg-secondary"
                  />
                </div>

                {/* Title */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...(formData.our_story || [])]
                      updated[index] = { ...updated[index], title: e.target.value }
                      setFormData({ ...formData, our_story: updated })
                    }}
                    placeholder="e.g., How We Met"
                    className="bg-secondary"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...(formData.our_story || [])]
                      updated[index] = { ...updated[index], description: e.target.value }
                      setFormData({ ...formData, our_story: updated })
                    }}
                    placeholder="Tell your guests about this moment..."
                    rows={3}
                    className="bg-secondary resize-none"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => {
                const updated = [...(formData.our_story || []), { id: `story_${Date.now()}`, date: "", image_url: "", title: "", description: "" }]
                setFormData({ ...formData, our_story: updated })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Story Item
            </Button>
          </div>

      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t border-border">
        <Button type="submit" className="flex-1" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Updating Wedding...
            </>
          ) : (
            "Update Wedding"
          )}
        </Button>
      </div>
    </form>
  )
}
