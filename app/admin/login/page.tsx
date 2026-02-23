import { redirect } from "next/navigation"
import { checkAdminAuth } from "./actions"
import { AdminLoginForm } from "@/components/admin-login-form"

export default async function AdminLoginPage() {
  const isAuthenticated = await checkAdminAuth()

  if (isAuthenticated) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <AdminLoginForm />
    </div>
  )
}
