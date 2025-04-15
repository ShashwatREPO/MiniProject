"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Inbox, Trash2, Send, Search, PenSquare, MoreVertical } from "lucide-react"
import { useEmail } from "@/context/email-context"

interface MainLayoutProps {
  children: React.ReactNode
  currentFolder: "inbox" | "sent" | "trash"
  onCompose: () => void
}

export function MainLayout({ children, currentFolder, onCompose }: MainLayoutProps) {
  const { getCurrentFolderEmails, setFilteredEmails } = useEmail()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    const folderEmails = getCurrentFolderEmails(currentFolder)
    const filtered = folderEmails.filter(email =>
      email.subject.toLowerCase().includes(query.toLowerCase()) ||
      email.sender.toLowerCase().includes(query.toLowerCase()) ||
      email.body.toLowerCase().includes(query.toLowerCase())
    )

    setFilteredEmails(filtered)
  }

  const getTitle = () => {
    switch (currentFolder) {
      case "inbox": return "Inbox"
      case "sent": return "Sent"
      case "trash": return "Trash"
      default: return "Mail"
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
          <Button variant="outline" size="sm" className="ml-4">Select</Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <PenSquare className="h-5 w-5" onClick={onCompose} />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-gray-900 border-gray-700"
          />
        </div>
      </div>

      <div className="flex space-x-2 p-2">
        <Link href="/inbox" className="flex-1">
          <Button variant={currentFolder === "inbox" ? "default" : "secondary"} className="w-full">
            <Inbox className="h-4 w-4 mr-2" />
            Inbox
          </Button>
        </Link>
        <Link href="/trash" className="flex-1">
          <Button variant={currentFolder === "trash" ? "default" : "secondary"} className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Junk
          </Button>
        </Link>
        <Link href="/sent" className="flex-1">
          <Button variant={currentFolder === "sent" ? "default" : "secondary"} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Sent
          </Button>
        </Link>
      </div>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
