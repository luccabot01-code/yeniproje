"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guestName: string
  message: string
}

export function MessageDialog({ open, onOpenChange, guestName, message }: MessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Message from {guestName}</DialogTitle>
          <DialogDescription>Full guest message</DialogDescription>
        </DialogHeader>
        <div className="mt-4 overflow-y-auto overflow-x-hidden max-w-full">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: "anywhere" }}>
            {message}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
