"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Bus, BedDouble } from "lucide-react"
import { RSVP } from "@/lib/types"

const fadeUp = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, filter: "blur(0px)",
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

interface TravelLodgingDashboardProps {
  rsvps: RSVP[]
}

function PartyComposition({ rsvp }: { rsvp: RSVP }) {
  const guests = rsvp.accompanying_guests ?? []
  const hasPlusone = rsvp.has_plusone && rsvp.plusone_name && guests.length === 0
  const all: { name: string; isChild: boolean; ageRange?: string }[] = []

  if (hasPlusone) all.push({ name: rsvp.plusone_name!, isChild: false })
  guests.forEach((g) => {
    const name = [g.firstName, g.lastName].filter(Boolean).join(" ") || "Guest"
    all.push({ name, isChild: !!g.isChild, ageRange: g.ageRange })
  })

  if (all.length === 0) return <span className="text-xs text-muted-foreground/50 italic">Solo</span>

  return (
    <div className="space-y-0.5">
      {all.map((m, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="text-muted-foreground">{m.name}</span>
          {m.isChild ? (
            <span className="inline-flex items-center px-1.5 py-0 rounded border text-[10px] font-normal text-muted-foreground border-border leading-4">
              Child{m.ageRange ? `: ${m.ageRange}` : ""}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">Adult</span>
          )}
        </div>
      ))}
    </div>
  )
}

function ShuttleBadge({ value }: { value: string }) {
  const v = value.toLowerCase()
  if (v.startsWith("yes")) return (
    <Badge variant="default" className="text-xs font-normal whitespace-normal text-left h-auto py-0.5">{value}</Badge>
  )
  if (v.startsWith("no")) return (
    <Badge variant="secondary" className="text-xs font-normal whitespace-normal text-left h-auto py-0.5">{value}</Badge>
  )
  if (v.startsWith("maybe")) return (
    <Badge variant="outline" className="text-xs font-normal text-amber-600 border-amber-400 whitespace-normal text-left h-auto py-0.5">{value}</Badge>
  )
  if (v.startsWith("need info")) return (
    <Badge variant="outline" className="text-xs font-normal text-blue-600 border-blue-400 whitespace-normal text-left h-auto py-0.5">{value}</Badge>
  )
  return <span className="text-xs text-muted-foreground italic">{value}</span>
}

function HotelBadge({ value }: { value: string }) {
  const v = value.toLowerCase()
  if (v.startsWith("booked")) return (
    <Badge variant="default" className="text-xs font-normal bg-emerald-600 hover:bg-emerald-700 whitespace-normal text-left h-auto py-0.5">{value}</Badge>
  )
  if (v.startsWith("planning")) return (
    <Badge variant="outline" className="text-xs font-normal text-amber-600 border-amber-400 whitespace-normal text-left h-auto py-0.5">{value}</Badge>
  )
  if (v.startsWith("staying")) return (
    <Badge variant="secondary" className="text-xs font-normal whitespace-normal text-left h-auto py-0.5">{value}</Badge>
  )
  if (v.startsWith("local")) return (
    <Badge variant="outline" className="text-xs font-normal text-muted-foreground whitespace-normal text-left h-auto py-0.5">{value}</Badge>
  )
  return <span className="text-xs text-muted-foreground italic">{value}</span>
}

export function TravelLodgingDashboard({ rsvps }: TravelLodgingDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const travelLodgingData = useMemo(() => {
    return rsvps
      .filter((r) => r.attendance_status === "attending")
      .map((r) => ({
        id: r.id,
        rsvp: r,
        guestName: r.guest_name,
        needsShuttle: r.needs_shuttle || "Not specified",
        bookedHotel: r.booked_hotel || "Not specified",
        totalInParty: 1 + (r.accompanying_guests?.length || 0),
      }))
  }, [rsvps])

    const stats = useMemo(() => {
      let totalShuttleSeats = 0
      let totalHotelRooms = 0
      travelLodgingData.forEach((party) => {
        const shuttle = party.needsShuttle.toLowerCase()
        const hotel = party.bookedHotel.toLowerCase()
        if (shuttle.startsWith("yes")) totalShuttleSeats += party.totalInParty
        if (hotel.startsWith("booked") || hotel.startsWith("planning")) totalHotelRooms += 1
      })
      return { totalShuttleSeats, totalHotelRooms }
    }, [travelLodgingData])

  const filteredData = useMemo(() => {
    if (!searchQuery) return travelLodgingData
    const lowerQuery = searchQuery.toLowerCase()
    return travelLodgingData.filter(
      (r) =>
        r.guestName.toLowerCase().includes(lowerQuery) ||
        r.needsShuttle.toLowerCase().includes(lowerQuery) ||
        r.bookedHotel.toLowerCase().includes(lowerQuery)
    )
  }, [travelLodgingData, searchQuery])

  const handleExportCSV = () => {
    const headers = ["Guest Name", "Party Size", "Shuttle Service", "Hotel Status"]
    const rows = filteredData.map(r => [
      `"${r.guestName.replace(/"/g, '""')}"`,
      `"${r.totalInParty}"`,
      `"${r.needsShuttle.replace(/"/g, '""')}"`,
      `"${r.bookedHotel.replace(/"/g, '""')}"`
    ])
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "travel_lodging_logistics.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Travel & Lodging</h2>
          <p className="text-muted-foreground text-sm">Coordinate guest transportation and accommodation.</p>
        </div>
        <Button onClick={handleExportCSV} className="w-full sm:w-auto shrink-0" disabled={travelLodgingData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export Logistics (CSV)
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2">
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shuttle Seats</CardTitle>
              <Bus className="h-4 w-4 text-blue-500 shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShuttleSeats}</div>
              <p className="text-xs text-muted-foreground mt-1">Based on party sizes</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hotel Rooms</CardTitle>
              <BedDouble className="h-4 w-4 text-emerald-500 shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHotelRooms}</div>
              <p className="text-xs text-muted-foreground mt-1">Booked or planning</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search bar */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <div className="relative border rounded-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or status..."
            className="pl-8 border-0 focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Mobile card list */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="md:hidden space-y-3">
        {filteredData.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No logistics data found.</p>
        ) : filteredData.map((data) => (
          <Card key={data.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{data.guestName}</p>
                <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
                  Party of {data.totalInParty}
                </span>
              </div>
              <PartyComposition rsvp={data.rsvp} />
              <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Shuttle</p>
                  <ShuttleBadge value={data.needsShuttle} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Hotel</p>
                  <HotelBadge value={data.bookedHotel} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Desktop table */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="hidden md:block">
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg">Logistics Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Guest Name</TableHead>
                    <TableHead>Party Composition</TableHead>
                    <TableHead>Shuttle</TableHead>
                    <TableHead>Hotel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((data, i) => (
                      <motion.tr
                        key={data.id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-medium align-top py-3">{data.guestName}</TableCell>
                        <TableCell className="align-top py-3"><PartyComposition rsvp={data.rsvp} /></TableCell>
                        <TableCell className="align-top py-3"><ShuttleBadge value={data.needsShuttle} /></TableCell>
                        <TableCell className="align-top py-3"><HotelBadge value={data.bookedHotel} /></TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No logistics data found.</TableCell>
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
