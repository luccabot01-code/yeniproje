"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, UtensilsCrossed, Users, AlertTriangle } from "lucide-react"
import type { RSVP } from "@/lib/types"

const fadeUp = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

interface GuestListCateringDashboardProps {
  rsvps: RSVP[]
}

interface FlatGuest {
  id: string
  guestName: string
  partyLeader: string
  isPartyLeader: boolean
  partySize: number
  ageGroup: "Adult" | "Child"
  ageRange?: string
  mealChoice: string
  dietaryNotes: string
}

export function GuestListCateringDashboard({ rsvps }: GuestListCateringDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const attendingRsvps = useMemo(
    () => rsvps.filter((r) => r.attendance_status === "attending"),
    [rsvps]
  )

  const allGuests = useMemo(() => {
    const rows: FlatGuest[] = []
    attendingRsvps.forEach((rsvp) => {
      const accGuests = rsvp.accompanying_guests ?? []
      const hasPlusone = rsvp.has_plusone && rsvp.plusone_name && accGuests.length === 0
      const totalParty = 1 + accGuests.length + (hasPlusone ? 1 : 0)

      rows.push({
        id: `main-${rsvp.id}`,
        guestName: rsvp.guest_name,
        partyLeader: rsvp.guest_name,
        isPartyLeader: true,
        partySize: totalParty,
        ageGroup: "Adult",
        ageRange: undefined,
        mealChoice: rsvp.meal_choice || rsvp.meal_preference || (rsvp.meal_choices && rsvp.meal_choices[0]) || "—",
        dietaryNotes: rsvp.dietary_restrictions || "",
      })

      if (hasPlusone) {
        rows.push({
          id: `plusone-${rsvp.id}`,
          guestName: rsvp.plusone_name!,
          partyLeader: rsvp.guest_name,
          isPartyLeader: false,
          partySize: 0,
          ageGroup: "Adult",
          ageRange: undefined,
          mealChoice: "—",
          dietaryNotes: "",
        })
      }

      accGuests.forEach((g, idx) => {
        const name = [g.firstName, g.lastName].filter(Boolean).join(" ") || `Guest ${idx + 1}`
        rows.push({
          id: `acc-${rsvp.id}-${idx}`,
          guestName: name,
          partyLeader: rsvp.guest_name,
          isPartyLeader: false,
          partySize: 0,
          ageGroup: g.isChild ? "Child" : "Adult",
          ageRange: g.isChild ? g.ageRange : undefined,
          mealChoice: g.meal_choice || g.mealPreference || "—",
          dietaryNotes: g.dietaryRestrictions || "",
        })
      })
    })
    return rows
  }, [attendingRsvps])

  const stats = useMemo(() => {
    const mealCounts: Record<string, number> = {}
    let withDietary = 0
    let children = 0
    allGuests.forEach((g) => {
      if (g.ageGroup === "Child") children++
      if (g.dietaryNotes.trim()) withDietary++
      const key = g.mealChoice || "—"
      if (key !== "—") mealCounts[key] = (mealCounts[key] || 0) + 1
    })
    const totalMeals = Object.values(mealCounts).reduce((s, n) => s + n, 0)
    const sorted = Object.entries(mealCounts).sort((a, b) => b[1] - a[1])
    return { totalGuests: allGuests.length, children, withDietary, mealCounts: sorted, totalMeals }
  }, [allGuests])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return allGuests
    const q = searchQuery.toLowerCase()
    return allGuests.filter(
      (g) =>
        g.guestName.toLowerCase().includes(q) ||
        g.partyLeader.toLowerCase().includes(q) ||
        g.mealChoice.toLowerCase().includes(q)
    )
  }, [allGuests, searchQuery])

  const handleExport = () => {
    const headers = ["Guest Name", "Party Leader", "Role", "Age Group", "Age Range", "Meal Choice", "Dietary Notes"]
      const rows = filtered.map((g) => [
        `"${g.guestName.replace(/"/g, '""')}"`,
        `"${g.partyLeader.replace(/"/g, '""')}"`,
        `"${g.isPartyLeader ? "Primary" : "Guest"}"`,
        `"${g.ageGroup}"`,
        `"${g.ageRange ?? ""}"`,
        `"${g.mealChoice.replace(/"/g, '""')}"`,
        `"${g.dietaryNotes.replace(/"/g, '""')}"`,
      ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "guest_catering_export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Guest List & Catering</h2>
          <p className="text-muted-foreground text-sm">Individual meal selections for every guest in your party.</p>
        </div>
        <Button onClick={handleExport} disabled={allGuests.length === 0} className="w-full sm:w-auto shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Export for Caterer
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          {
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            label: "Total Covers",
            value: stats.totalGuests,
            sub: `${stats.totalGuests - stats.children} adults · ${stats.children} children`,
          },
          {
            icon: <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />,
            label: "Meals Selected",
            value: stats.totalMeals,
            sub: `${Math.max(0, stats.totalGuests - stats.totalMeals)} pending selection`,
          },
          {
            icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
            label: "Dietary Notes",
            value: stats.withDietary,
            sub: "guests with special requirements",
          },
        ].map((card, i) => (
          <motion.div key={card.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Catering overview */}
      {stats.mealCounts.length > 0 && (
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-semibold">Catering Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Meal selection breakdown across all guests</p>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {stats.mealCounts.map(([meal, count]) => {
                const pct = stats.totalMeals > 0 ? Math.round((count / stats.totalMeals) * 100) : 0
                return (
                  <div key={meal} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="font-medium truncate">{meal}</span>
                      <span className="tabular-nums text-muted-foreground shrink-0">
                        {count}<span className="text-xs"> / {stats.totalMeals}</span>
                        <span className="ml-2 text-xs font-semibold">{pct}%</span>
                      </span>
                    </div>
                    <div className="h-[3px] w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-foreground"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
        <div className="relative border rounded-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or meal…"
            className="pl-8 border-0 focus-visible:ring-0 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Mobile card list */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {searchQuery ? "No guests match your search." : "No attending guests yet."}
          </p>
        ) : filtered.map((guest) => (
          <div
            key={guest.id}
            className={`rounded-lg border p-3 space-y-2 ${!guest.isPartyLeader ? "ml-4 bg-muted/10" : "bg-card"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {!guest.isPartyLeader && <span className="text-muted-foreground/40 text-xs shrink-0">└</span>}
                <p className={`font-medium truncate ${guest.isPartyLeader ? "text-sm" : "text-xs text-muted-foreground"}`}>
                  {guest.guestName}
                </p>
                {guest.isPartyLeader && guest.partySize > 1 && (
                  <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-4 shrink-0">
                    Party of {guest.partySize}
                  </Badge>
                )}
              </div>
              {guest.ageGroup === "Child" ? (
                <Badge variant="outline" className="font-normal text-xs shrink-0 shadow-none">
                  Child{guest.ageRange ? `: ${guest.ageRange}` : ""}
                </Badge>
              ) : (
                <span className="text-[10px] text-muted-foreground/60 shrink-0">Adult</span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <div>
                <span className="text-muted-foreground">Meal: </span>
                {guest.mealChoice === "—"
                  ? <span className="italic text-muted-foreground/50">Not selected</span>
                  : <span className="font-medium">{guest.mealChoice}</span>
                }
              </div>
              {guest.dietaryNotes && (
                <div>
                  <span className="text-muted-foreground">Dietary: </span>
                  <span className="text-amber-600">{guest.dietaryNotes}</span>
                </div>
              )}
              {!guest.isPartyLeader && (
                <div>
                  <span className="text-muted-foreground">Party: </span>
                  <span>{guest.partyLeader}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Desktop table */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="hidden md:block">
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold">Detailed Guest List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[220px] pl-4">Guest</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead className="w-[90px]">Age</TableHead>
                    <TableHead>Meal Choice</TableHead>
                    <TableHead className="min-w-[180px]">Dietary Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length > 0 ? (
                    filtered.map((guest) => (
                      <TableRow
                        key={guest.id}
                        className={`border-b transition-colors hover:bg-muted/30 ${!guest.isPartyLeader ? "bg-muted/10" : ""}`}
                      >
                        <TableCell className="pl-4 py-3">
                          <div className="flex items-center gap-2">
                            {!guest.isPartyLeader && (
                              <span className="text-muted-foreground/40 select-none text-xs pl-1">└</span>
                            )}
                            <span className={`font-medium ${!guest.isPartyLeader ? "text-sm text-muted-foreground" : ""}`}>
                              {guest.guestName}
                            </span>
                            {guest.isPartyLeader && guest.partySize > 1 && (
                              <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-4 shrink-0">
                                Party of {guest.partySize}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {guest.isPartyLeader
                            ? <span className="text-xs italic text-muted-foreground/50">—</span>
                            : guest.partyLeader
                          }
                        </TableCell>
                        <TableCell>
                          {guest.ageGroup === "Child" ? (
                            <Badge variant="outline" className="font-normal text-xs shadow-none">
                              Child{guest.ageRange ? `: ${guest.ageRange}` : ""}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Adult</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {guest.mealChoice === "—"
                            ? <span className="text-muted-foreground/50 text-sm italic">Not selected</span>
                            : <span className="text-sm font-medium">{guest.mealChoice}</span>
                          }
                        </TableCell>
                        <TableCell>
                          {guest.dietaryNotes
                            ? <span className="text-amber-600 text-sm">{guest.dietaryNotes}</span>
                            : <span className="text-muted-foreground/50 text-sm italic">None</span>
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                        {searchQuery ? "No guests match your search." : "No attending guests yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
