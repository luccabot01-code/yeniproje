"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MapPin, Eye, Upload, Clock, Plus, Trash2, ArrowUp, ArrowDown, Heart, Sparkles, UtensilsCrossed } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { createEventAction } from "@/app/actions"
import { createClient } from "@/lib/supabase/client"
import type { CreateEventInput, EventType, ItineraryItem, OurStoryItem, MenuOption } from "@/lib/types"
import { motion } from "framer-motion"
import { RSVPForm } from "./rsvp-form"
import { generateSlug, formatDate } from "@/lib/utils/event-helpers"

const formCardVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export function EventForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string>("image")
  const [showPreview, setShowPreview] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdEventSlug, setCreatedEventSlug] = useState<string | null>(null)
  const scrollPositionRef = useRef(0)

    // Save and restore scroll position when modal opens/closes
  useEffect(() => {
    if (showPreview) {
      scrollPositionRef.current = window.scrollY
      document.documentElement.style.scrollBehavior = 'auto'
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px'
      return
    }

    if (scrollPositionRef.current === 0) return

    const scrollY = scrollPositionRef.current
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    window.scrollTo(0, scrollY)

    const interval = setInterval(() => {
      window.scrollTo(0, scrollY)
    }, 10)

    const timer = setTimeout(() => {
      clearInterval(interval)
      document.documentElement.style.scrollBehavior = ''
    }, 200)

    // Cleanup handles both the interval and timer if the component unmounts
    // before the 200ms window closes (e.g. navigation away)
    return () => {
      clearInterval(interval)
      clearTimeout(timer)
      document.body.style.overflow = ''
      document.documentElement.style.scrollBehavior = ''
    }
  }, [showPreview])

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

  // Our Story image upload handler
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

  const handlePreview = () => {
    if (!formData.title || !formData.date || !formData.location || !formData.host_name || !formData.host_email) {
      setError("Please fill in all required fields before previewing")
      return
    }
    setError(null)
    setShowPreview(true)
  }

  const handleClosePreview = (open: boolean) => {
    if (!open) {
      // Prevent any default behavior
      const scrollY = scrollPositionRef.current
      setTimeout(() => {
        window.scrollTo(0, scrollY)
      }, 0)
    }
    setShowPreview(open)
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

  if (showPreview) {
    const previewEvent = {
      id: "preview",
      slug: "preview",
      event_type: formData.event_type,
      title: formData.title,
      date: formData.date ? formData.date.replace("T", " ") : new Date().toISOString(), // Convert "YYYY-MM-DDTHH:MM" to "YYYY-MM-DD HH:MM"
      location: formData.location,
      location_url: formData.location_url,
      dress_code: formData.dress_code,
      program_notes: formData.program_notes,
      cover_image_url: photoUrl || undefined,
      media_type: photoUrl ? mediaType : undefined,
        allow_plusone: formData.allow_plusone || false,
        custom_attendance_options: formData.custom_attendance_options || [],
      theme_color: formData.theme_color || "#000000",
      theme_style: formData.theme_style || "default",
      host_name: formData.host_name,
      host_email: formData.host_email,
      is_active: true,
      apply_theme_to_dashboard: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      registry_url: formData.registry_url || undefined,
        itinerary: formData.itinerary || [],
        menu_options_jsonb: formData.menu_options_jsonb || [],
        show_countdown: formData.show_countdown ?? false,
        our_story: formData.our_story || [],
      }

    return (
      <Dialog open={showPreview} onOpenChange={handleClosePreview} modal={false}>
        <DialogContent
          className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0 bg-background border border-border shadow-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/30 [scrollbar-width:thin]"
          showCloseButton={false}
        >
          <div className="overflow-x-hidden w-full">
            <DialogTitle className="sr-only">Preview RSVP Form</DialogTitle>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleClosePreview(false)
              }}
              className="absolute top-4 right-4 p-3 rounded-full bg-background hover:bg-muted transition-colors duration-200 z-50 cursor-pointer border border-border"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <motion.div
              className="relative p-8 bg-primary text-primary-foreground overflow-hidden border-b border-border rounded-t-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-5"></div>

              <div className="relative z-10">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-4 border border-primary-foreground/20"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  <Eye className="h-8 w-8" />
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  Preview Mode
                </motion.h2>
                <motion.p
                  className="text-primary-foreground/80 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  See how your invitation will look to guests
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              className="p-6 md:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="space-y-8">
                <motion.div
                  className="text-center space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-block px-5 py-2 bg-secondary border border-border text-foreground rounded-full text-sm font-medium shadow-sm">
                    Wedding
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance break-words overflow-wrap-anywhere max-w-full">{formData.title}</h1>
                  <p className="text-lg md:text-xl text-muted-foreground">You're invited!</p>
                </motion.div>

                {photoPreview && (
                  <motion.div
                    className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-border"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt={formData.title}
                      className="w-full h-auto object-contain max-h-[500px] bg-muted"
                    />
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="bg-secondary/50 border border-border shadow-lg">
                    <CardContent className="pt-8 pb-8 px-6 md:px-8 space-y-8">
                      <div className="flex items-start gap-5">
                        <div className="p-3 rounded-xl bg-primary/10 border border-border flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="pt-0.5">
                          <p className="font-semibold mb-2 text-base">Date & Time</p>
                          <p className="text-muted-foreground text-base">
                            {formData.date ? formatDate(formData.date.replace("T", " ")) : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5">
                        <div className="p-3 rounded-xl bg-primary/10 border border-border flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="font-semibold mb-2 text-base">Location</p>
                          <p className="text-muted-foreground text-base">{formData.location}</p>
                          {formData.location_url && (
                            <a
                              href={formData.location_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary hover:underline text-sm mt-2 font-medium"
                            >
                              View on map →
                            </a>
                          )}
                        </div>
                      </div>

                      {formData.dress_code && (
                        <div className="flex items-start gap-5">
                          <div className="p-3 rounded-xl bg-primary/10 border border-border flex-shrink-0">
                            <span className="text-xl">👔</span>
                          </div>
                          <div className="pt-0.5">
                            <p className="font-semibold mb-1 text-base">Dress Code</p>
                            <p className="text-muted-foreground text-base">{formData.dress_code}</p>
                          </div>
                        </div>
                      )}

                      {formData.program_notes && (
                        <div className="pt-6 border-t border-border">
                          <p className="font-semibold mb-3 text-base">Wedding Details</p>
                          {formData.program_notes.length > 30 ? (
                            <div>
                              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base">
                                {formData.program_notes.slice(0, 30)}...
                              </p>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="text-primary hover:underline text-sm mt-3 font-medium">Read more</button>
                                </DialogTrigger>
                                <DialogContent
                                  className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto p-6 bg-background border border-border shadow-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/30 [scrollbar-width:thin]"
                                  showCloseButton={true}
                                >
                                  <DialogTitle className="sr-only">Wedding Details</DialogTitle>
                                  <div className="w-full">
                                    <h3 className="text-xl font-bold mb-4 break-words">Wedding Details</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap break-all leading-relaxed text-base">
                                      {formData.program_notes}
                                    </p>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base">
                              {formData.program_notes}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <h2 className="text-2xl font-semibold mb-6 text-center">RSVP Form Preview</h2>
                  <RSVPForm event={previewEvent} isPreview={true} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
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
              <Label htmlFor="cover_image">Upload Wedding Photo or Video (Optional)</Label>
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
              <Label htmlFor="location_url">Location URL (Optional)</Label>
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
              <Label htmlFor="registry_url">Gift Registry or Fund URL (Optional)</Label>
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
              <Label htmlFor="dress_code">Dress Code (Optional)</Label>
              <Input
                id="dress_code"
                value={formData.dress_code}
                onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                placeholder="Formal / Black Tie / Casual"
                className="input-glow transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program_notes">Program / Notes (Optional)</Label>
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

      {/* Event Itinerary Section */}
      <motion.div variants={formCardVariants} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
        <Card className="glass-card shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Wedding Day Itinerary (Optional)
            </CardTitle>
            <CardDescription>Add a timeline of activities for your guests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.itinerary || []).map((item: ItineraryItem, index: number) => (
              <motion.div
                key={index}
                className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-border bg-secondary/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex-shrink-0 w-full sm:w-28">
                  <Label className="text-xs text-muted-foreground mb-1 block">Time</Label>
                  <Input
                    value={item.time}
                    onChange={(e) => {
                      const newItinerary = [...(formData.itinerary || [])]
                      newItinerary[index] = { ...newItinerary[index], time: e.target.value }
                      setFormData({ ...formData, itinerary: newItinerary })
                    }}
                    placeholder="6:00 PM"
                    className="input-glow transition-all duration-300"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => {
                      const newItinerary = [...(formData.itinerary || [])]
                      newItinerary[index] = { ...newItinerary[index], title: e.target.value }
                      setFormData({ ...formData, itinerary: newItinerary })
                    }}
                    placeholder="Cocktail Hour"
                    className="input-glow transition-all duration-300"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                  <div className="flex gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => {
                        const newItinerary = [...(formData.itinerary || [])]
                        newItinerary[index] = { ...newItinerary[index], description: e.target.value }
                        setFormData({ ...formData, itinerary: newItinerary })
                      }}
                      placeholder="Optional details..."
                      className="input-glow transition-all duration-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        const newItinerary = (formData.itinerary || []).filter((_, i) => i !== index)
                        setFormData({ ...formData, itinerary: newItinerary })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed bg-transparent"
              onClick={() => {
                const newItinerary = [...(formData.itinerary || []), { time: "", title: "", description: "" }]
                setFormData({ ...formData, itinerary: newItinerary })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Timeline Item
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Countdown Settings */}
      <motion.div variants={formCardVariants} initial="hidden" animate="visible" transition={{ delay: 0.07 }}>
        <Card className="glass-card shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="show_countdown_create" className="text-base font-medium cursor-pointer">
                  Show Wedding Countdown
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display a beautiful, animated countdown to the Big Day on the public RSVP page.
                </p>
              </div>
              <Switch
                id="show_countdown_create"
                checked={formData.show_countdown ?? false}
                onCheckedChange={(checked) => setFormData({ ...formData, show_countdown: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Our Story Management */}
      <motion.div variants={formCardVariants} initial="hidden" animate="visible" transition={{ delay: 0.08 }}>
          <Card className="glass-card shadow-soft hover:shadow-soft-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Manage Our Story (Optional)
              </CardTitle>
              <CardDescription>Share your love story with your guests on the RSVP page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData.our_story || []).map((item: OurStoryItem, index: number) => (
                <motion.div
                  key={index}
                  className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
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
                          const newStory = [...(formData.our_story || [])]
                            ;[newStory[index - 1], newStory[index]] = [newStory[index], newStory[index - 1]]
                          setFormData({ ...formData, our_story: newStory })
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
                          const newStory = [...(formData.our_story || [])]
                            ;[newStory[index], newStory[index + 1]] = [newStory[index + 1], newStory[index]]
                          setFormData({ ...formData, our_story: newStory })
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
                          const newStory = (formData.our_story || []).filter((_, i) => i !== index)
                          setFormData({ ...formData, our_story: newStory })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Image</Label>
                    {item.image_url ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                        <img src={item.image_url} alt={item.title || "Story image"} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const newStory = [...(formData.our_story || [])]
                            newStory[index] = { ...newStory[index], image_url: "" }
                            setFormData({ ...formData, our_story: newStory })
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
                          id={`story-image-${index}`}
                          className="hidden"
                          onChange={(e) => handleStoryImageUpload(e, index)}
                        />
                        <div
                          onClick={() => document.getElementById(`story-image-${index}`)?.click()}
                          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-white/30 dark:bg-white/20"
                        >
                          <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Click to upload</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Date (Optional)</Label>
                    <Input
                      value={item.date || ""}
                      onChange={(e) => {
                        const newStory = [...(formData.our_story || [])]
                        newStory[index] = { ...newStory[index], date: e.target.value }
                        setFormData({ ...formData, our_story: newStory })
                      }}
                      placeholder="e.g., March 2021"
                      className="input-glow transition-all duration-300"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const newStory = [...(formData.our_story || [])]
                        newStory[index] = { ...newStory[index], title: e.target.value }
                        setFormData({ ...formData, our_story: newStory })
                      }}
                      placeholder="e.g., How We Met"
                      className="input-glow transition-all duration-300"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => {
                        const newStory = [...(formData.our_story || [])]
                        newStory[index] = { ...newStory[index], description: e.target.value }
                        setFormData({ ...formData, our_story: newStory })
                      }}
                      placeholder="Tell your guests about this moment..."
                      rows={3}
                      className="input-glow transition-all duration-300 resize-none"
                    />
                  </div>
                </motion.div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed bg-transparent"
                onClick={() => {
                  const newStory = [...(formData.our_story || []), { id: `story_${Date.now()}`, date: "", image_url: "", title: "", description: "" }]
                  setFormData({ ...formData, our_story: newStory })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Story Item
              </Button>
            </CardContent>
          </Card>
          </motion.div>

      {/* Menu Options Section */}
      <motion.div variants={formCardVariants} initial="hidden" animate="visible" transition={{ delay: 0.09 }}>
        <Card className="glass-card shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Menu Options (Optional)
            </CardTitle>
            <CardDescription>Add custom menu choices for your guests to select when they RSVP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.menu_options_jsonb || []).map((item: MenuOption, index: number) => (
              <motion.div
                key={index}
                className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground tracking-wide">Option {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (formData.menu_options_jsonb || []).filter((_, i) => i !== index)
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
                    className="input-glow transition-all duration-300"
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
                    className="input-glow transition-all duration-300 resize-none"
                  />
                </div>
              </motion.div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed bg-transparent"
              onClick={() => {
                const updated = [...(formData.menu_options_jsonb || []), { id: `menu_${Date.now()}`, title: "", description: "" }]
                setFormData({ ...formData, menu_options_jsonb: updated })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Option
            </Button>
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
        {/* Preview RSVP Form */}
        <motion.div whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
          <button
            type="button"
            onClick={handlePreview}
            className="preview-btn relative w-full h-11 px-6 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4 opacity-70" />
            Preview RSVP Form
          </button>
        </motion.div>

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
