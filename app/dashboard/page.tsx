import { redirect } from "next/navigation"
import { getHostSession } from "@/lib/auth/host-session"
import { HostDashboardClient } from "@/components/host-dashboard-client"

export default async function HostDashboardPage() {
  const hostEmail = await getHostSession()

  if (!hostEmail) {
    redirect("/")
  }

  return <HostDashboardClient hostEmail={hostEmail} />
}
