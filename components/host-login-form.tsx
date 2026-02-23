"use client"

import type React from "react"

import { useState } from "react"
import { hostLogin } from "@/app/host-login/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"

export function HostLoginForm({ onSwitchToCreate }: { onSwitchToCreate?: () => void }) {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNoEventsModal, setShowNoEventsModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await hostLogin(email, token.trim() || null)

      if (result.success && result.noEvents) {
        setShowNoEventsModal(true)
        setIsLoading(false)
        return
      }

      if (!result.success) {
        setError(result.error || "Login failed")
        setIsLoading(false)
      }
      // If result.success is true and no noEvents, redirect is happening - don't set loading to false
    } catch (err) {
      // Check if this is a Next.js redirect error (which is expected behavior)
      if (err instanceof Error && err.message?.includes("NEXT_REDIRECT")) {
        // This is a successful redirect, don't show error
        return
      }
      console.error("[v0] Host login error:", err)
      setError("An error occurred during login")
      setIsLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setShowNoEventsModal(false)
    onSwitchToCreate?.()
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="glass-card shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Access Your Dashboard</CardTitle>
              <CardDescription>Enter your email and access token to manage your weddings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="login-email">Your Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  inputMode="email"
                  className="input-glow transition-all duration-300"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Label htmlFor="login-token">
                  Access Token <span className="text-muted-foreground text-xs">(only needed first time)</span>
                </Label>
                <Input
                  id="login-token"
                  type="text"
                  name="token"
                  autoComplete="off"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your access token"
                  className="input-glow transition-all duration-300 font-mono"
                />
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  className="create-wedding-btn w-full py-3 px-6 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? "Checking..." : "Access Dashboard"}
                  </span>
                </motion.button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showNoEventsModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
                <DialogTitle>No Weddings Found</DialogTitle>
                <DialogDescription>
                  We couldn't find any weddings associated with this email. Please create a wedding first.
                </DialogDescription>
            </DialogHeader>
          <div className="mt-4">
            <Button onClick={handleCreateEvent} className="w-full">
              Create Wedding
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
