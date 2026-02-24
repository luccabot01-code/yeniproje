export interface ItineraryItem {
  time: string
  title: string
  description: string
}

export interface MenuOption {
  id?: string
  title: string
  description: string
}

export interface OurStoryItem {
  id?: string
  date?: string
  image_url: string
  title: string
  description: string
}

export type EventType =
  | "wedding"
  | "engagement"
  | "baby_shower"
  | "bridal_shower"
  | "anniversary"
  | "custom"

export interface AccompanyingGuest {
  firstName: string
  lastName: string
  isChild?: boolean
  ageRange?: "0-3" | "3-12" | string   // "0-3" | "3-12" for new submissions
  meal_choice?: string
  // legacy fields kept for backward compat
  mealPreference?: string
  dietaryRestrictions?: string
}

export interface Event {
  id: string
  created_at: string
  updated_at: string
  event_type: EventType
  title: string
  date: string
  location: string
  location_url?: string
  dress_code?: string
  program_notes?: string
  rsvp_deadline?: string
  allow_plusone: boolean
  custom_attendance_options: string[]
  slug: string
  theme_color: string
  cover_image_url?: string
  media_type?: string
  theme_style: string
  apply_theme_to_dashboard: boolean
  host_name: string
  host_email: string
  is_active: boolean
  registry_url?: string
  itinerary?: ItineraryItem[]
  show_countdown?: boolean
  show_itinerary?: boolean
  show_our_story?: boolean
  show_menu?: boolean
  show_song_request?: boolean
  show_travel_lodging?: boolean
  our_story?: OurStoryItem[]
  menu_options_jsonb?: MenuOption[]
  /** Alias — same column, used in catering step */
  custom_menus?: MenuOption[]
}

export interface SeatingTable {
  id: string
  event_id: string
  name: string
  capacity: number
  category?: string
  created_at: string
  updated_at: string
}

export interface CreateEventInput {
  event_type: EventType
  title: string
  date: string
  location: string
  location_url?: string
  dress_code?: string
  program_notes?: string
  rsvp_deadline?: string
  allow_plusone?: boolean
  custom_attendance_options?: string[]
  theme_color?: string
  theme_style?: string
  cover_image_url?: string
  media_type?: string
  host_name: string
  host_email: string
  registry_url?: string
  itinerary?: ItineraryItem[]
  show_countdown?: boolean
  show_itinerary?: boolean
  show_our_story?: boolean
  show_menu?: boolean
  show_song_request?: boolean
  show_travel_lodging?: boolean
  our_story?: OurStoryItem[]
  menu_options_jsonb?: MenuOption[]
}

export interface CreateRSVPInput {
  event_id: string
  guest_name: string
  guest_email?: string
  guest_phone?: string
  attendance_status: "attending" | "not_attending"
  number_of_guests?: number
  has_plusone?: boolean
  plusone_name?: string
  /** Primary guest's meal choice (title string) */
  meal_choice?: string
  message?: string
  /** Each entry carries name + meal_choice */
  accompanying_guests?: AccompanyingGuest[]
  song_request?: string
  needs_shuttle?: string
  booked_hotel?: string
}

export interface RSVP {
  id: string
  created_at: string
  updated_at: string
  event_id: string
  guest_name: string
  guest_email?: string
  guest_phone?: string
  attendance_status: string
  number_of_guests: number
  has_plusone: boolean
  plusone_name?: string
  meal_choice?: string
  meal_choices?: string[]
  meal_preference?: string
  dietary_restrictions?: string
  message?: string
  accompanying_guests?: AccompanyingGuest[]
  song_request?: string
  needs_shuttle?: string
  booked_hotel?: string
  ip_address?: string
  user_agent?: string
  table_id?: string
}

export interface UpdateEventInput {
  event_type: EventType
  title: string
  date: string
  location: string
  location_url?: string
  dress_code?: string
  program_notes?: string
  rsvp_deadline?: string
  allow_plusone?: boolean
  custom_attendance_options?: string[]
  theme_color?: string
  theme_style?: string
  cover_image_url?: string
  media_type?: string
  host_email: string
  registry_url?: string
  itinerary?: ItineraryItem[]
  show_countdown?: boolean
  show_itinerary?: boolean
  show_our_story?: boolean
  show_menu?: boolean
  show_song_request?: boolean
  show_travel_lodging?: boolean
  our_story?: OurStoryItem[]
  menu_options_jsonb?: MenuOption[]
}
