import { redirect } from "next/navigation"
import { checkAdminAuth } from "./login/actions"
import { AdminPanelClient } from "@/components/admin-panel-client"

export default async function AdminPage() {
  const isAuthenticated = await checkAdminAuth()

  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return <AdminPanelClient />
}
