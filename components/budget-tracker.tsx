"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus, Trash2, Edit2, AlertTriangle, PieChart as PieChartIcon, Wallet,
    CreditCard, ChevronDown, CheckCircle2, Circle,
    Clock, Info, ExternalLink, Users, BarChart3, Download
} from "lucide-react"
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

export interface Expense {
    id: string
    category: string
    name: string
    estimated_cost: number
    actual_cost: number | null
    deposit_paid: number
    due_date: string
    paid_by: string
    vendor_name?: string
    contract_link?: string
}

const CATEGORIES = [
    "Venue", "Catering", "Photography", "Videography",
    "Attire", "Decor", "Entertainment", "Rings",
    "Stationery", "Beauty", "Other"
]

const PAID_BY_OPTIONS = [
    "The Couple", "Bride's Family", "Groom's Family", "Other"
]

const CHART_COLORS = [
    "#6366f1",
    "#10b981",
    "#f43f5e",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#f97316",
    "#3b82f6",
    "#14b8a6",
    "#64748b",
]

interface BudgetTrackerProps {
    eventId: string
}

export function BudgetTracker({ eventId }: BudgetTrackerProps) {
    const [totalBudget, setTotalBudget] = useState<number>(15000)
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const supabaseRef = useRef(createClient())
    const supabase = supabaseRef.current

    const fetchData = useCallback(async () => {
        const [{ data: expensesData }, { data: settingsData }] = await Promise.all([
            supabase.from("budget_expenses").select("*").eq("event_id", eventId).order("created_at", { ascending: true }),
            supabase.from("budget_settings").select("*").eq("event_id", eventId).single()
        ])

        if (expensesData) setExpenses(expensesData as Expense[])
        if (settingsData) setTotalBudget(settingsData.total_budget)
        setIsLoaded(true)
    }, [eventId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Form State
    const [formName, setFormName] = useState("")
    const [formCategory, setFormCategory] = useState("")
    const [formEstimatedCost, setFormEstimatedCost] = useState<number | "">("")
    const [formActualCost, setFormActualCost] = useState<number | "">("")
    const [formDepositPaid, setFormDepositPaid] = useState<number | "">("")
    const [formDueDate, setFormDueDate] = useState("")
    const [formPaidBy, setFormPaidBy] = useState("The Couple")
    const [formVendorName, setFormVendorName] = useState("")
    const [formContractLink, setFormContractLink] = useState("")
    const [formError, setFormError] = useState("")

    // Calculations
    const calculations = useMemo(() => {
        const total_expenses = expenses.reduce((sum, exp) => {
            const cost = exp.actual_cost !== null ? exp.actual_cost : exp.estimated_cost
            return sum + (cost || 0)
        }, 0)

        const total_paid = expenses.reduce((sum, exp) => sum + (exp.deposit_paid || 0), 0)
        const total_remaining = expenses.reduce((sum, exp) => {
            const cost = exp.actual_cost !== null ? exp.actual_cost : exp.estimated_cost
            return sum + (cost - (exp.deposit_paid || 0))
        }, 0)

        const progress_percentage = totalBudget > 0 ? (total_expenses / totalBudget) * 100 : 0

        return {
            total_expenses,
            total_paid,
            total_remaining,
            progress_percentage
        }
    }, [expenses, totalBudget])

    // Data Aggregation for Chart
    const categoryData = useMemo(() => {
        const aggregated = expenses.reduce((acc, exp) => {
            const cost = exp.actual_cost !== null ? exp.actual_cost : exp.estimated_cost
            acc[exp.category] = (acc[exp.category] || 0) + (cost || 0)
            return acc
        }, {} as Record<string, number>)

        return Object.entries(aggregated)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [expenses])

    const handleUpdateBudget = async () => {
        const newBudget = prompt("Set Project Budget:", totalBudget.toString())
        if (!newBudget || isNaN(Number(newBudget))) return
        const val = Number(newBudget)
        setTotalBudget(val)
        await supabase
            .from("budget_settings")
            .upsert({ event_id: eventId, total_budget: val, updated_at: new Date().toISOString() }, { onConflict: "event_id" })
    }

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        if (!formName || !formCategory || formEstimatedCost === "" || formDepositPaid === "") {
            setFormError("Please fill out all required fields.")
            return
        }

        const estCost = Number(formEstimatedCost)
        const actCost = formActualCost === "" ? null : Number(formActualCost)
        const dPaid = Number(formDepositPaid)
        const targetCost = actCost !== null ? actCost : estCost

        if (estCost < 0 || (actCost !== null && actCost < 0) || dPaid < 0) {
            setFormError("Costs cannot be negative.")
            return
        }

        if (dPaid > targetCost) {
            setFormError("Deposit paid cannot exceed the current cost.")
            return
        }

        const newExpense = {
            event_id: eventId,
            name: formName,
            category: formCategory,
            estimated_cost: estCost,
            actual_cost: actCost,
            deposit_paid: dPaid,
            due_date: formDueDate || null,
            paid_by: formPaidBy,
            vendor_name: formVendorName || null,
            contract_link: formContractLink || null
        }

        const { data, error } = await supabase.from("budget_expenses").insert(newExpense).select().single()
        if (!error && data) {
            setExpenses(prev => [...prev, data as Expense])
        }
        resetForm()
    }

    const exportExpensesToCSV = () => {
        if (expenses.length === 0) return

        const headers = ["Item Name", "Category", "Allocation (Payer)", "Estimated Cost", "Actual Cost", "Deposit Paid", "Remaining Balance", "Status"]

        const rows = expenses.map(exp => {
            const cost = exp.actual_cost !== null ? exp.actual_cost : exp.estimated_cost
            const remaining = cost - exp.deposit_paid
            const status = exp.deposit_paid >= cost && cost > 0 ? "Fully Paid" : exp.deposit_paid > 0 ? "Partial" : "Planning"

            return [
                `"${exp.name.replace(/"/g, '""')}"`,
                `"${exp.category}"`,
                `"${exp.paid_by}"`,
                exp.estimated_cost,
                exp.actual_cost ?? exp.estimated_cost,
                exp.deposit_paid,
                remaining,
                `"${status}"`
            ]
        })

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "wedding_budget_export.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDeleteExpense = async (id: string) => {
        const previousExpenses = expenses
        setExpenses(prev => prev.filter(e => e.id !== id))
        const { error } = await supabase.from("budget_expenses").delete().eq("id", id)
        if (error) {
            console.error("Failed to delete expense:", error)
            setExpenses(previousExpenses)
        }
    }

    const resetForm = () => {
        setFormName("")
        setFormCategory("")
        setFormEstimatedCost("")
        setFormActualCost("")
        setFormDepositPaid("")
        setFormDueDate("")
        setFormPaidBy("The Couple")
        setFormVendorName("")
        setFormContractLink("")
        setFormError("")
        setIsAddModalOpen(false)
    }

    const getProgressColor = () => {
        const p = calculations.progress_percentage
        if (p > 100) return "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
        if (p >= 80) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
        return "bg-primary shadow-[0_0_10px_var(--primary)]"
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val)
    }

    const getStatusBadge = (expense: Expense) => {
        const cost = expense.actual_cost !== null ? expense.actual_cost : expense.estimated_cost
        if (expense.deposit_paid >= cost && cost > 0) {
            return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Fully Paid</Badge>
        }
        if (expense.deposit_paid > 0) {
            return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1"><Clock className="h-3 w-3" /> Partial</Badge>
        }
        return <Badge variant="outline" className="text-muted-foreground flex items-center gap-1"><Circle className="h-3 w-3" /> Planning</Badge>
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const percentage = totalBudget > 0 ? (data.value / totalBudget * 100).toFixed(1) : "0"
            return (
                <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-white/10 backdrop-blur-md">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{data.name}</p>
                    <p className="text-lg font-bold">{formatCurrency(data.value)}</p>
                    <p className="text-[10px] text-primary font-bold">{percentage}% of Total Project</p>
                </div>
            )
        }
        return null
    }

    if (!isLoaded) return <div className="min-h-[600px]" />

    const cardVariants = {
        hidden: { opacity: 0, filter: "blur(4px)" },
        visible: (i: number) => ({
            opacity: 1, filter: "blur(0px)",
            transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
        })
    }

    return (
        <div className="w-full space-y-8 pb-32">

            {/* Premium Dashboard Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: "Budget Strategy",
                        icon: <Wallet className="h-5 w-5" />,
                        iconClass: "bg-primary/10 text-primary",
                        content: (
                            <>
                                <CardTitle className="text-3xl font-bold flex items-center gap-3 mt-1">
                                    {formatCurrency(totalBudget)}
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={handleUpdateBudget}>
                                        <Edit2 className="h-3 w-3" />
                                    </Button>
                                </CardTitle>
                                <div className="text-xs text-muted-foreground mt-2">Target allocation for entire wedding event</div>
                            </>
                        )
                    },
                    {
                        label: "Total Commitments",
                        icon: <BarChart3 className="h-5 w-5" />,
                        iconClass: calculations.progress_percentage > 100 ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary',
                        content: (
                            <>
                                <CardTitle className={`text-3xl font-bold tracking-tight mt-1 ${calculations.progress_percentage > 100 ? 'text-rose-500' : 'text-foreground'}`}>
                                    {formatCurrency(calculations.total_expenses)}
                                </CardTitle>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(calculations.progress_percentage, 100)}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                                            className={`h-full ${getProgressColor()}`}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{calculations.progress_percentage.toFixed(0)}%</span>
                                </div>
                            </>
                        )
                    },
                    {
                        label: "Cash Outflow Remaining",
                        icon: <CreditCard className="h-5 w-5" />,
                        iconClass: "bg-emerald-500/10 text-emerald-500",
                        content: (
                            <>
                                <CardTitle className="text-3xl font-bold mt-1 text-foreground">
                                    {formatCurrency(calculations.total_remaining)}
                                </CardTitle>
                                <div className="flex justify-between items-center text-xs mt-2">
                                    <span className="text-muted-foreground">Settled Amount:</span>
                                    <span className="font-bold text-emerald-500">{formatCurrency(calculations.total_paid)}</span>
                                </div>
                            </>
                        )
                    }
                ].map((card, i) => (
                    <motion.div
                        key={card.label}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="relative overflow-hidden shadow-md group h-full">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{card.label}</CardDescription>
                                    <div className={`p-2.5 rounded-full ${card.iconClass} transition-transform group-hover:scale-110`}>
                                        {card.icon}
                                    </div>
                                </div>
                                {card.content}
                            </CardHeader>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Visual Data Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <motion.div
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <Card className="shadow-md overflow-hidden rounded-2xl">
                        <CardHeader className="p-6 pb-0">
                            <div className="flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5 text-primary" />
                                <CardTitle className="text-xl font-bold">Spending Allocation</CardTitle>
                            </div>
                            <CardDescription>Breakdown of costs by wedding category</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 flex flex-col items-center justify-center min-h-0">
                            {expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-10">
                                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted flex items-center justify-center mb-4">
                                        <PieChartIcon className="h-8 w-8 text-muted opacity-20" />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Add expenses to see your budget breakdown</p>
                                </div>
                            ) : (
                                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_300px] items-center gap-4 lg:gap-8">
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    innerRadius={80}
                                                    outerRadius={110}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    animationBegin={0}
                                                    animationDuration={1500}
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Legend & Distribution</h4>
                                        <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {categoryData.map((entry, index) => (
                                                <div key={entry.name} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{entry.name}</span>
                                                    </div>
                                                    <span className="text-sm font-mono text-muted-foreground group-hover:text-primary transition-colors">{formatCurrency(entry.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Financial Ledger Section */}
            <motion.div
                initial={{ opacity: 0, y: 32, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
            <Card className="shadow-md overflow-hidden rounded-2xl">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b bg-muted/20 px-6 md:px-8 py-6">
                    <div>
                        <CardTitle className="text-xl font-bold">Financial Ledger</CardTitle>
                        <CardDescription>Ultra-Premium spending & variance tracking</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Button
                            onClick={exportExpensesToCSV}
                            disabled={expenses.length === 0}
                            className="w-full sm:w-auto shrink-0 justify-center"
                        >
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            size="lg"
                            className="w-full sm:w-auto justify-center"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Record Expense
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                                    <th className="px-8 py-4">Financial Item</th>
                                    <th className="px-6 py-4">Allocation</th>
                                    <th className="px-6 py-4">Cost Variance</th>
                                    <th className="px-6 py-4">Settlement</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                <AnimatePresence>
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <Info className="h-12 w-12 mb-3" />
                                                    <p className="font-medium text-lg">No financial entries recorded.</p>
                                                    <p className="text-sm">Start by adding your first vendor commitment.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : expenses.map(expense => {
                                        const currentCost = expense.actual_cost !== null ? expense.actual_cost : expense.estimated_cost
                                        const variance = expense.actual_cost !== null ? (expense.actual_cost - expense.estimated_cost) : 0
                                        const remaining = currentCost - expense.deposit_paid

                                        return (
                                            <motion.tr
                                                key={expense.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-muted/10 transition-colors"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground">{expense.name}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[9px] h-4 rounded-md font-bold uppercase">{expense.category}</Badge>
                                                            {expense.vendor_name && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="h-2 w-2" /> {expense.vendor_name}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-muted-foreground">{expense.paid_by}</span>
                                                        {expense.due_date && <span className="text-[10px] text-muted-foreground mt-0.5">{new Date(expense.due_date).toLocaleDateString()}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm">{formatCurrency(currentCost)}</span>
                                                            {variance !== 0 && (
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${variance > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                                    {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground italic">Est: {formatCurrency(expense.estimated_cost)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-emerald-600 font-bold">{formatCurrency(expense.deposit_paid)}</span>
                                                        <span className="text-[10px] text-orange-500 font-medium">Balance: {formatCurrency(remaining)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {getStatusBadge(expense)}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {expense.contract_link && (
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                                                                <a href={expense.contract_link} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-sm bg-muted/20 sm:bg-transparent"
                                                            onClick={() => handleDeleteExpense(expense.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                  </CardContent>
              </Card>
            </motion.div>

              {/* Add Expense Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                if (!open) resetForm()
                setIsAddModalOpen(open)
            }}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
                    <DialogHeader className="p-8 bg-primary text-primary-foreground relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJjdXJyZW50Q29sb3IiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMyIgY3k9IjMiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-20" />
                        <div className="relative z-10">
                            <DialogTitle className="text-2xl font-bold">New Financial Allocation</DialogTitle>
                            <DialogDescription className="text-primary-foreground/70">Record a commitment or actual spending to your ledger.</DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleAddExpense}>
                        <Tabs defaultValue="primary" className="w-full">
                            <div className="bg-muted/50 px-8 border-b">
                                <TabsList className="bg-transparent h-12 w-full justify-start gap-6 rounded-none p-0">
                                    <TabsTrigger value="primary" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">Core Details</TabsTrigger>
                                    <TabsTrigger value="financial" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">Financials</TabsTrigger>
                                    <TabsTrigger value="advanced" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">Advanced</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-8 pb-4">
                                <AnimatePresence>
                                    {formError && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-6 bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-bold border border-rose-500/20 flex items-center gap-3">
                                            <AlertTriangle className="h-4 w-4" />
                                            {formError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <TabsContent value="primary" className="space-y-5 mt-0">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-tight">Expense Name</Label>
                                        <Input placeholder="e.g. Catering Deposit, Wedding Band..." className="h-11 rounded-xl" value={formName} onChange={e => setFormName(e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-tight">Category</Label>
                                            <Select value={formCategory} onValueChange={setFormCategory} required>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-tight">Responsible Party</Label>
                                            <Select value={formPaidBy} onValueChange={setFormPaidBy}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PAID_BY_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="financial" className="space-y-5 mt-0">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-tight">Estimated Cost</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3 text-muted-foreground text-sm font-bold">$</span>
                                                <Input type="number" step="1" className="pl-8 h-11 rounded-xl font-bold" value={formEstimatedCost} onChange={e => setFormEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-tight">Actual Cost (Confirmed)</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3 text-muted-foreground text-sm font-bold">$</span>
                                                <Input type="number" step="1" className="pl-8 h-11 rounded-xl font-bold border-primary/30 focus-visible:ring-primary" value={formActualCost} onChange={e => setFormActualCost(e.target.value === '' ? '' : Number(e.target.value))} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-tight">Amount Already Paid</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-emerald-600 text-sm font-bold">$</span>
                                            <Input type="number" step="1" className="pl-8 h-11 rounded-xl border-emerald-500/20 text-emerald-600 font-bold bg-emerald-500/5 transition-all focus-visible:ring-emerald-500" value={formDepositPaid} onChange={e => setFormDepositPaid(e.target.value === '' ? '' : Number(e.target.value))} required />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="advanced" className="space-y-5 mt-0">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-tight">Vendor / Service Provider</Label>
                                        <Input placeholder="e.g. Marriott Hotels LLC" className="h-11 rounded-xl" value={formVendorName} onChange={e => setFormVendorName(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-tight">Target Payment Date</Label>
                                            <Input type="date" className="h-11 rounded-xl" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-tight">Contract / Invoice URL</Label>
                                            <Input placeholder="Link to Google Drive/PDF" className="h-11 rounded-xl" value={formContractLink} onChange={e => setFormContractLink(e.target.value)} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        <DialogFooter className="p-8 bg-muted/20 border-t mt-4 flex justify-between items-center sm:justify-between">
                            <div className="text-[10px] text-muted-foreground max-w-[200px]">By saving, this item will immediately impact your wedding's total cash flow projections.</div>
                            <div className="flex gap-3">
                                <Button type="button" variant="ghost" className="rounded-xl px-6" onClick={resetForm}>Discard</Button>
                                <Button type="submit" size="lg">Project Commitment</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
