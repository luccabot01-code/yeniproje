"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    CheckCircle2,
    Circle,
    Calendar,
    Clock,
    Plus,
    Trash2,
    LayoutList,
    Target,
    PartyPopper,
    Sparkles,
    Award,
    ListTodo,
    AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Task {
    id: string
    text: string
    category: string
    completed: boolean
}

const TIMEFRAMES = [
    { id: "12m", label: "12+ Months Out", icon: PartyPopper, color: "bg-slate-900" },
    { id: "6m", label: "6-9 Months Out", icon: Calendar, color: "bg-slate-700" },
    { id: "3m", label: "3 Months Out", icon: Clock, color: "bg-slate-500" },
    { id: "1m", label: "The Final Month", icon: Target, color: "bg-slate-400" },
    { id: "post", label: "Post-Wedding", icon: Award, color: "bg-slate-300" }
]

interface WeddingChecklistProps {
    eventId: string
}

export function WeddingChecklist({ eventId }: WeddingChecklistProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newTaskText, setNewTaskText] = useState("")
    const [newTaskCategory, setNewTaskCategory] = useState("12m")
    const [isLoaded, setIsLoaded] = useState(false)
    const supabaseRef = useRef(createClient())
    const supabase = supabaseRef.current

    const fetchTasks = useCallback(async () => {
        const { data } = await supabase
            .from("checklist_tasks")
            .select("*")
            .eq("event_id", eventId)
            .order("created_at", { ascending: true })
        if (data) setTasks(data as Task[])
        setIsLoaded(true)
    }, [eventId])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return
        const updated = !task.completed
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updated } : t))
        await supabase.from("checklist_tasks").update({ completed: updated }).eq("id", id)
    }

    const deleteTask = async (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id))
        await supabase.from("checklist_tasks").delete().eq("id", id)
    }

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskText.trim()) return

        const newTask = {
            event_id: eventId,
            text: newTaskText,
            category: newTaskCategory,
            completed: false
        }

        const { data, error } = await supabase.from("checklist_tasks").insert(newTask).select().single()
        if (!error && data) {
            setTasks(prev => [...prev, data as Task])
        }
        setNewTaskText("")
        setIsAddModalOpen(false)
    }

    const completedCount = tasks.filter(t => t.completed).length
    const totalCount = tasks.length
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    if (!isLoaded) return <div className="min-h-[600px]" />

    return (
        <div className="space-y-6">
            {/* Professional Framed Hero */}
            <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
            <Card className="overflow-hidden shadow-sm rounded-2xl p-0.5 border border-border">
                <CardContent className="p-6 md:p-10 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3">
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">Management Dashboard</Badge>
                            <h2 className="text-3xl md:text-4xl font-black text-foreground">Your Wedding Readiness</h2>
                            <p className="text-muted-foreground text-lg max-w-md">Track every milestone on your journey to the big day. {totalCount - completedCount} tasks remaining.</p>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-3 min-w-[200px]">
                            <div className="relative flex items-center justify-center">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="transparent"
                                        className="text-primary/20"
                                    />
                                    <motion.circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray={251.2}
                                        initial={{ strokeDashoffset: 251.2 }}
                                        animate={{ strokeDashoffset: 251.2 - (251.2 * progressPercentage) / 100 }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="text-primary"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-black text-foreground">{progressPercentage}%</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">Overall Completion</span>
                        </div>
                    </div>

                    <div className="mt-10">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3 text-muted-foreground">
                            <span>Progress Path</span>
                            <span>{completedCount} / {totalCount} Items Done</span>
                        </div>
                        <Progress value={progressPercentage} className="h-1.5 bg-primary/20" />
                    </div>
                </CardContent>
            </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <ListTodo className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground italic tracking-tight font-serif">Planning Milestones</h3>
                        <p className="text-[11px] text-muted-foreground font-medium">Categorized timeline of wedding preparations</p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    size="lg"
                    className="flex-shrink-0"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                </Button>
            </motion.div>

            <Accordion type="multiple" defaultValue={["12m", "6m", "3m", "1m", "post"]} className="space-y-4">
                {TIMEFRAMES.map((tf, tfIndex) => {
                    const categoryTasks = tasks.filter(t => t.category === tf.id)
                    const completedInCategory = categoryTasks.filter(t => t.completed).length
                    const Icon = tf.icon

                    return (
                        <motion.div
                            key={tf.id}
                            initial={{ opacity: 0, filter: "blur(3px)" }}
                            whileInView={{ opacity: 1, filter: "blur(0px)" }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.45, delay: tfIndex * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                        <AccordionItem key={tf.id} value={tf.id} className="border border-border shadow-sm rounded-2xl bg-card text-card-foreground overflow-hidden">
                            <AccordionTrigger className="px-6 py-5 hover:no-underline group hover:bg-muted/5 transition-all">
                                <div className="flex items-center justify-between w-full pr-4 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 border border-primary/20 shadow-sm`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">{tf.label}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                                                {completedInCategory} / {categoryTasks.length} Completed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2">
                                <div className="space-y-1">
                                    {categoryTasks.length === 0 ? (
                                        <div className="py-8 text-center border-2 border-dashed border-muted rounded-xl">
                                            <p className="text-sm text-muted-foreground">No tasks in this timeframe yet.</p>
                                        </div>
                                    ) : (
                                        categoryTasks.map((task) => (
                                            <motion.div
                                                key={task.id}
                                                layout
                                                className="flex items-center group/item hover:bg-muted/30 p-3 rounded-xl transition-all"
                                            >
                                                <button
                                                    onClick={() => toggleTask(task.id)}
                                                    className={`flex-shrink-0 mr-4 transition-colors p-1 rounded-full ${task.completed ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                                >
                                                    {task.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <span className={`text-sm md:text-base font-medium transition-all duration-300 block truncate ${task.completed ? 'text-muted-foreground line-through opacity-50' : 'text-foreground'}`}>
                                                        {task.text}
                                                    </span>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteTask(task.id)}
                                                    className="h-8 w-8 rounded-full opacity-0 group-hover/item:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        </motion.div>
                    )
                })}
            </Accordion>

            {/* Add Task Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
                    <DialogHeader className="p-8 bg-primary text-primary-foreground relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJjdXJyZW50Q29sb3IiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMyIgY3k9IjMiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-20" />
                        <div className="relative z-10">
                            <DialogTitle className="text-2xl font-bold">New Planning Milestone</DialogTitle>
                            <DialogDescription className="text-primary-foreground/70">Add a new task to your wedding preparations timeline.</DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={addTask}>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-tight">Task Description</Label>
                                <Input
                                    placeholder="e.g. Confirm guest count with caterer..."
                                    className="h-11 rounded-xl"
                                    value={newTaskText}
                                    onChange={e => setNewTaskText(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-tight">Timeframe Category</Label>
                                <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Select Timeframe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIMEFRAMES.map(tf => (
                                            <SelectItem key={tf.id} value={tf.id}>
                                                <div className="flex items-center gap-2">
                                                    <tf.icon className="h-3.5 w-3.5" />
                                                    {tf.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 text-slate-950 dark:text-zinc-100 mt-0.5" />
                                <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                                    This task will be automatically added to your selected timeline category and will contribute to your overall wedding readiness percentage.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-muted/20 border-t flex justify-between items-center">
                            <div className="flex gap-3 ml-auto">
                                <Button type="button" variant="ghost" className="rounded-md px-6" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
                                <Button type="submit" size="lg">Add Milestone</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
