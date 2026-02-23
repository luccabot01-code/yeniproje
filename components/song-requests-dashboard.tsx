"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Music } from "lucide-react"
import { RSVP } from "@/lib/types"

const fadeUp = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, filter: "blur(0px)",
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

interface SongRequestsDashboardProps {
    rsvps: RSVP[]
}

export function SongRequestsDashboard({ rsvps }: SongRequestsDashboardProps) {
    const [searchQuery, setSearchQuery] = useState("")

    // Filter out RSVPs that are attending AND have a valid song request
    const songRequests = useMemo(() => {
        return rsvps
            .filter((r) => r.attendance_status === "attending" && r.song_request && r.song_request.trim().length > 0)
            .map((r) => ({
                id: r.id,
                guestName: r.guest_name,
                songRequest: r.song_request!.trim(),
            }))
    }, [rsvps])

    // Apply search query
    const filteredRequests = useMemo(() => {
        if (!searchQuery) return songRequests
        const lowerQuery = searchQuery.toLowerCase()
        return songRequests.filter(
            (r) =>
                r.guestName.toLowerCase().includes(lowerQuery) ||
                r.songRequest.toLowerCase().includes(lowerQuery)
        )
    }, [songRequests, searchQuery])

    // CSV Export for DJ
    const handleExportCSV = () => {
        const headers = ["Guest Name", "Song Request"]

        const rows = filteredRequests.map(r => [
            `"${r.guestName.replace(/"/g, '""')}"`,
            `"${r.songRequest.replace(/"/g, '""')}"`
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "dj_song_requests.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Song Requests</h2>
                    <p className="text-muted-foreground text-sm">
                        See what tracks will get your guests on the dance floor.
                    </p>
                </div>
                <Button
                    onClick={handleExportCSV}
                    className="shrink-0"
                    disabled={songRequests.length === 0}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export for DJ (CSV)
                </Button>
            </motion.div>

            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Music className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{songRequests.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Songs requested by attending guests
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Requested Songs</CardTitle>
                            <div className="relative w-64 border rounded-md">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search name or song..."
                                    className="pl-8 border-0 focus-visible:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Guest Name</TableHead>
                                        <TableHead>Song Request</TableHead>
                                    </TableRow>
                                </TableHeader>
                                  <TableBody>
                                      {filteredRequests.length > 0 ? (
                                          filteredRequests.map((request, i) => (
                                              <motion.tr
                                                  key={request.id}
                                                  custom={i}
                                                  variants={fadeUp}
                                                  initial="hidden"
                                                  animate="visible"
                                                  className="border-b transition-colors hover:bg-muted/50"
                                              >
                                                <TableCell className="font-medium">{request.guestName}</TableCell>
                                                <TableCell>{request.songRequest}</TableCell>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                                No song requests found.
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
