"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, UserX, UserPlus } from "lucide-react"
import type { RSVP } from "@/lib/types"
import { motion } from "framer-motion"

interface DashboardStatsProps {
  rsvps: RSVP[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

export function DashboardStats({ rsvps }: DashboardStatsProps) {
  const validRsvps = rsvps.filter((r) => r.attendance_status === "attending" || r.attendance_status === "not_attending")

  const totalResponses = validRsvps.length

    const attendingGuests = validRsvps
      .filter((r) => r.attendance_status === "attending")
      .reduce((sum, r) => sum + (Number(r.number_of_guests) || 0), 0)

    const notAttendingGuests = validRsvps
      .filter((r) => r.attendance_status === "not_attending")
      .reduce((sum, r) => sum + (Number(r.number_of_guests) || 0), 0)

  const totalGuests = attendingGuests + notAttendingGuests

  const stats = [
    {
      label: "Total Guests",
      value: totalGuests,
      icon: UserPlus,
    },
    {
      label: "Attending",
      value: attendingGuests,
      icon: UserCheck,
    },
    {
      label: "Not Attending",
      value: notAttendingGuests,
      icon: UserX,
    },
    {
      label: "Total Responses",
      value: totalResponses,
      icon: Users,
    },
  ]

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={cardVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-secondary border border-border hover:border-muted-foreground/30 transition-all duration-300 overflow-hidden group">
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl p-2.5 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <motion.p
                    className="text-3xl md:text-4xl font-bold tabular-nums text-foreground"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
