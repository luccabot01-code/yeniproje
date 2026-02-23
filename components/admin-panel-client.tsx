"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createHostToken, markTokenAsSent, getHostTokens, deleteHostToken } from "@/app/admin/actions"
import { adminLogout } from "@/app/admin/login/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, LogOut, Mail, Key, Clock, Send, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface HostToken {
  id: string
  email: string
  token: string
  token_used: boolean
  sent_via_etsy: boolean
  created_at: string
}

export function AdminPanelClient() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [tokens, setTokens] = useState<HostToken[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    const data = await getHostTokens()
    setTokens(data)
  }

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    setGeneratedToken(null)

    const result = await createHostToken(email)

    if (result.success && result.token) {
      setGeneratedToken(result.token)
      setEmail("")
      await loadTokens()
    } else {
      setError(result.error || "Failed to create token")
    }

    setIsCreating(false)
  }

  const handleMarkAsSent = async (hostId: string) => {
    const result = await markTokenAsSent(hostId)
    if (result.success) {
      await loadTokens()
    } else {
      setError(result.error || "Failed to update token")
    }
  }

  const handleDeleteToken = async (hostId: string) => {
    if (!confirm("Are you sure you want to delete this token?")) return

    const result = await deleteHostToken(hostId)
    if (result.success) {
      await loadTokens()
    } else {
      setError(result.error || "Failed to delete token")
    }
  }

  const handleCopyToken = async (token: string, id: string) => {
    await navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push("/admin/login")
    router.refresh()
  }

  const maskToken = (token: string) => {
    if (token.length <= 10) return token
    return `${token.substring(0, 6)}••••${token.substring(token.length - 4)}`
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return days === 1 ? "1d ago" : `${days}d ago`
    }
    if (hours > 0) {
      return `${hours}h ago`
    }
    return "Just now"
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage host access tokens</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Create Host Token</CardTitle>
            <CardDescription>Generate a new access token for a buyer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateToken} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="buyer-email">Buyer Email</Label>
                  <Input
                    id="buyer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="buyer@example.com"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Generating..." : "Generate Token"}
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {error}
                  </motion.div>
                )}

                {generatedToken && (
                  <motion.div
                    className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800 space-y-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Token generated successfully
                    </p>
                    <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-900 rounded-md border">
                      <code className="flex-1 text-xs font-mono break-all">{generatedToken}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleCopyToken(generatedToken, "new")}
                      >
                        {copiedId === "new" ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Token List</CardTitle>
            <CardDescription>
              {tokens.length} token{tokens.length !== 1 ? "s" : ""} created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokens.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No tokens created yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tokens.map((token) => (
                  <motion.div
                    key={token.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{token.email}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyToken(token.email, `email-${token.id}`)}
                        >
                          {copiedId === `email-${token.id}` ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="text-xs font-mono bg-muted px-2.5 py-1 rounded-md">
                        {maskToken(token.token)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyToken(token.token, token.id)}
                      >
                        {copiedId === token.id ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>

                    <div>
                      {token.token_used ? (
                        <Badge
                          variant="default"
                          className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 border-blue-200"
                        >
                          Used
                        </Badge>
                      ) : token.sent_via_etsy ? (
                        <Badge
                          variant="default"
                          className="bg-green-500/10 text-green-700 hover:bg-green-500/10 border-green-200"
                        >
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                          Not Sent
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-20">
                      <Clock className="h-3 w-3" />
                      <span>{getRelativeTime(token.created_at)}</span>
                    </div>

                    <div>
                      {!token.sent_via_etsy && !token.token_used && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 bg-transparent"
                          onClick={() => handleMarkAsSent(token.id)}
                        >
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          Mark Sent
                        </Button>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => handleDeleteToken(token.id)}
                      title="Delete Token"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
