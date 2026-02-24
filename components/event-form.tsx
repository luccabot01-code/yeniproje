"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Sparkles } from "lucide-react"
import { createEventAction } from "@/app/actions"
import { createClient } from "@/lib/supabase/client"
import type { CreateEventInput } from "@/lib/types"
import { motion } from "framer-motion"
import { generateSlug } from "@/lib/utils/event-helpers"

const formCardVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export function EventForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string>("image")
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdEventSlug, setCreatedEventSlug] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateEventInput>({
    event_type: "wedding",
    title: "",
    date: "",
    location: "",
    location_url: "",
    dress_code: "",
    program_notes: "",
    allow_plusone: true,
    custom_attendance_options: ["attending", "not_attending"],
    theme_color: "#000000",
    theme_style: "default",
    host_name: "",
    host_email: "",
    registry_url: "",
        itinerary: [],
          show_countdown: false,
          our_story: [],
          menu_options_jsonb: [],
      })

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
      // Generate preview
      if (isImage) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        // For video, use object URL for preview
        const objectUrl = URL.createObjectURL(file)
        // Revoke any previous video object URL before setting the new one
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
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) {
        throw new Error(error.message || "Upload failed")
      }

      const { data: { publicUrl } } = supabase.storage
        .from("event-media")
        .getPublicUrl(data.path)

      setPhotoUrl(publicUrl)
      setMediaType(isVideo ? "video" : "image")
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
      setPhotoPreview(null)
      setPhotoUrl(null)
      setMediaType("image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    // Guard against double-submit
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const slug = generateSlug(formData.title)

      const dateForDatabase = formData.date ? formData.date.replace("T", " ") : null

      const insertData: CreateEventInput & { slug: string } = {
        event_type: formData.event_type,
        title: formData.title,
        date: dateForDatabase || new Date().toISOString(),
        location: formData.location,
        location_url: formData.location_url || undefined,
        dress_code: formData.dress_code || undefined,
        program_notes: formData.program_notes || undefined,
          allow_plusone: formData.allow_plusone,
          custom_attendance_options: formData.custom_attendance_options,
        theme_color: formData.theme_color,
        theme_style: formData.theme_style,
        cover_image_url: photoUrl || undefined,
        media_type: photoUrl ? mediaType : undefined,
        host_name: formData.host_name,
        host_email: formData.host_email,
        registry_url: formData.registry_url || undefined,
          itinerary: formData.itinerary?.filter(item => item.time || item.title) || [],
          show_countdown: formData.show_countdown ?? false,
          our_story: formData.our_story?.filter(item => item.title || item.description || item.image_url) || [],
          menu_options_jsonb: formData.menu_options_jsonb?.filter(item => item.title) || [],
            slug,
      }

      console.log("[v0] Inserting event with data:", insertData)

      const event = await createEventAction(insertData)

      console.log("[v0] Event created successfully:", event)

      setCreatedEventSlug(slug)
      setIsSuccess(true)
      setIsLoading(false)
    } catch (err) {
      console.error("[v0] Event creation error:", err)
      setError(err instanceof Error ? err.message : "Failed to create wedding")
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-card shadow-soft">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <CardTitle className="text-2xl">Wedding Created Successfully!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your wedding has been created. To manage it and view RSVPs, please log in as host.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("switchToHostLogin"))
                }}
              >
                Log In as Host
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setIsSuccess(false)
                  setCreatedEventSlug(null)
                  setFormData({
                    event_type: "wedding",
                    title: "",
                    date: "",
                    location: "",
                    location_url: "",
                    dress_code: "",
                    program_notes: "",
                      allow_plusone: true,
                      custom_attendance_options: ["attending", "not_attending"],
                    theme_color: "#000000",
                    theme_style: "default",
                    host_name: "",
                    host_email: "",
                    registry_url: "",
                      itinerary: [],
                      show_countdown: false,
                      our_story: [],
                      menu_options_jsonb: [],
                    })
                  setPhotoPreview(null)
                  setPhotoUrl(null)
                  setMediaType("image")
                }}
              >
                Create Another Wedding
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="space-y-6"
    >
      <motion.div variants={formCardVariants} initial="hidden" animate="visible">
        <Card className="glass-card shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Wedding Details</CardTitle>
            <CardDescription>Basic information about your wedding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Wedding Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Sarah & John's Wedding"
                className="input-glow transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_image">Upload Wedding Photo or Video</Label>
              <div className="space-y-4">
                <input id="cover_image" type="file" accept="image/*,video/*" onChange={handlePhotoUpload} className="hidden" />
                {!photoPreview && (
                  <div
                    onClick={() => document.getElementById("cover_image")?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-white/30 dark:bg-white/20"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload photo or video</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 50MB</p>
                  </div>
                )}
                {photoPreview && (
                  <div className="relative">
                    {mediaType === "video" ? (
                      <video
                        src={photoPreview}
                        className="w-full h-48 object-cover rounded-xl"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Event preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span className="text-sm font-medium">Uploading...</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (photoPreview && photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview)
                        setPhotoPreview(null)
                        setPhotoUrl(null)
                        setMediaType("image")
                        const input = document.getElementById("cover_image") as HTMLInputElement
                        if (input) input.value = ""
                      }}
                      className="absolute top-2 right-2 rounded-lg px-3 py-1.5 text-xs font-medium bg-white/20 border border-white/40 hover:bg-white/30 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-glow transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Grand Hotel Ballroom, 123 Main St"
                className="input-glow transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_url">Location URL</Label>
              <Input
                id="location_url"
                type="url"
                value={formData.location_url}
                onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="input-glow transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registry_url">Gift Registry or Fund URL</Label>
              <Input
                id="registry_url"
                type="url"
                value={formData.registry_url || ""}
                onChange={(e) => setFormData({ ...formData, registry_url: e.target.value })}
                placeholder="e.g., https://www.zola.com/registry/..."
                className="input-glow transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dress_code">Dress Code</Label>
              <Input
                id="dress_code"
                value={formData.dress_code}
                onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                placeholder="Formal / Black Tie / Casual"
                className="input-glow transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program_notes">Program / Notes</Label>
              <Textarea
                id="program_notes"
                value={formData.program_notes}
                onChange={(e) => setFormData({ ...formData, program_notes: e.target.value })}
                placeholder="Ceremony starts at 4 PM, followed by cocktail hour..."
                rows={4}
                className="input-glow transition-all duration-300"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>



        <motion.div variants={formCardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="glass-card shadow-soft hover:shadow-soft-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Host Information</CardTitle>
            <CardDescription>Your contact details to manage the wedding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="host_name">Your Name</Label>
              <Input
                id="host_name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.host_name}
                onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                placeholder="Sarah Johnson"
                className="input-glow transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host_email">Your Email</Label>
              <Input
                id="host_email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={formData.host_email}
                onChange={(e) => setFormData({ ...formData, host_email: e.target.value })}
                placeholder="sarah@example.com"
                className="input-glow transition-all duration-300"
              />
              <p className="text-sm text-muted-foreground">Used to access your wedding dashboard</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
          {/* Create Wedding submit */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="create-wedding-btn relative w-full h-11 px-6 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="relative">Creating Wedding...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 opacity-80" />
                <span className="relative">Create Wedding</span>
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </form>
  )
}
