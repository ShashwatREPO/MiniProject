"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronUp,
  Paperclip,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  ImageIcon,
  LinkIcon,
  Plus,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Example auth hook – replace with your actual auth provider (e.g., NextAuth's useSession)
function useAuth() {
  return {
    user: { email: "studiodyre@gmail.com", name: "Studio Dyre" },
  }
}

interface ComposeModalProps {
  onClose: () => void
}

export function ComposeModal({ onClose }: ComposeModalProps) {
  const { user } = useAuth()
  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("Sent from my iPad")
  const [showCcBcc, setShowCcBcc] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Using axios to call your backend endpoint.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prepare the payload according to your API schema.
    // The API expects the senderId, recipientId, subject, body, and folder fields.
    const payload = {
      senderId: user.email,
      recipientID: to,
      cc,         // Include if supported by your backend
      bcc,        // Include if supported by your backend
      subject,
      body,
      folder: "sent",  // This ensures the email is saved in the Sent folder.
    }

    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Failed to send email")
      }

      // Optionally, you could show a success message here.
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to send email.")
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-black rounded-t-lg flex flex-col h-[80vh] mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <h2 className="text-xl font-bold">New Message</h2>
          <Button variant="ghost" size="icon">
      
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* TO Field */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center">
              <span className="w-20 text-gray-400">To:</span>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Recipient"
                required
              />
            </div>
          </div>

          {/* FROM Field */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center">
              <span className="w-20 text-gray-400">From:</span>
              <Input
                value={user.email}
                readOnly
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* SUBJECT Field */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center">
              <span className="w-20 text-gray-400">Subject:</span>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Subject"
              />
            </div>
          </div>

          {/* Email Body */}
          <div className="flex-1 p-4">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-full resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Footer with actions */}
          <div className="p-2 border-t border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
            </div>
            <Button type="submit" className="px-6">
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
