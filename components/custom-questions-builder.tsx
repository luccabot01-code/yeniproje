"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, Settings2 } from "lucide-react"

export interface CustomQuestion {
    id: string
    label: string
    type: "text" | "select"
    options: string[]
    required: boolean
}

interface CustomQuestionsBuilderProps {
    questions: CustomQuestion[]
    onChange: (questions: CustomQuestion[]) => void
}

export function CustomQuestionsBuilder({ questions, onChange }: CustomQuestionsBuilderProps) {
    const addQuestion = () => {
        const newQuestion: CustomQuestion = {
            id: Math.random().toString(36).substring(7),
            label: "",
            type: "text",
            options: [""],
            required: false,
        }
        onChange([...(questions || []), newQuestion])
    }

    const updateQuestion = (index: number, updates: Partial<CustomQuestion>) => {
        const newQuestions = [...(questions || [])]
        newQuestions[index] = { ...newQuestions[index], ...updates }
        onChange(newQuestions)
    }

    const removeQuestion = (index: number) => {
        onChange((questions || []).filter((_, i) => i !== index))
    }

    const addOption = (questionIndex: number) => {
        const newQuestions = [...(questions || [])]
        newQuestions[questionIndex].options.push("")
        onChange(newQuestions)
    }

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        const newQuestions = [...(questions || [])]
        newQuestions[questionIndex].options[optionIndex] = value
        onChange(newQuestions)
    }

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const newQuestions = [...(questions || [])]
        newQuestions[questionIndex].options.splice(optionIndex, 1)
        onChange(newQuestions)
    }

    const safeQuestions = questions || []

    return (
        <Card className="border border-border">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" />
                    Custom RSVP Questions
                </CardTitle>
                <CardDescription>
                    Add custom questions to your RSVP form to collect additional information from your guests.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {safeQuestions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border flex flex-col items-center gap-4 transition-colors hover:bg-secondary/50">
                        <div className="p-3 bg-background rounded-full shadow-sm">
                            <Settings2 className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">No custom questions yet</p>
                            <p className="text-sm mt-1">Ask guests about dietary needs, song requests, or anything else.</p>
                        </div>
                        <Button type="button" variant="outline" onClick={addQuestion} className="mt-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Question
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {safeQuestions.map((q, qIndex) => (
                            <Card key={q.id} className="relative overflow-visible group border-border hover:border-primary/50 transition-colors shadow-sm">
                                <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
                                    <div className="flex items-center gap-2 bg-background p-1 rounded-md border border-border">
                                        <Label htmlFor={`req-${q.id}`} className="text-xs text-muted-foreground cursor-pointer px-1">Required</Label>
                                        <Switch
                                            id={`req-${q.id}`}
                                            checked={q.required}
                                            onCheckedChange={(checked) => updateQuestion(qIndex, { required: checked })}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                        onClick={() => removeQuestion(qIndex)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <CardContent className="p-5 sm:p-6 sm:pr-40 space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-2 flex-shrink-0 cursor-grab text-muted-foreground/50 hover:text-foreground hidden sm:block">
                                            <GripVertical className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-1.5">
                                                <Label>Question Title</Label>
                                                <Input
                                                    placeholder="e.g. Will you join the after-party?"
                                                    value={q.label}
                                                    onChange={(e) => updateQuestion(qIndex, { label: e.target.value })}
                                                    className="font-medium"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label>Answer Type</Label>
                                                <Select
                                                    value={q.type}
                                                    onValueChange={(val: "text" | "select") => updateQuestion(qIndex, { type: val })}
                                                >
                                                    <SelectTrigger className="w-full sm:w-[220px] bg-secondary/50">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Short Text</SelectItem>
                                                        <SelectItem value="select">Dropdown Choice</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {q.type === "select" && (
                                        <div className="space-y-3 pt-4 pl-0 sm:pl-9 border-t border-border mt-4">
                                            <Label className="text-sm font-medium">Dropdown Options</Label>
                                            <div className="space-y-2">
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-primary/40 flex-shrink-0" />
                                                        <Input
                                                            placeholder={`Option ${optIndex + 1}`}
                                                            value={opt}
                                                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                            className="bg-secondary/30 h-9"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0"
                                                            onClick={() => removeOption(qIndex, optIndex)}
                                                            disabled={q.options.length <= 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => addOption(qIndex)}
                                                className="mt-2 text-xs h-8"
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add Choice
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        <div className="pt-2">
                            <Button type="button" variant="outline" onClick={addQuestion} className="w-full border-dashed py-6 text-muted-foreground hover:text-foreground">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Question
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
