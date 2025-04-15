"use client"
import { Button } from "@/components/ui/button"
import { RefreshCcw, MailOpen, MailX, Trash2 } from "lucide-react"
import { useEmail } from "@/context/email-context"
import type { EmailFolder } from "@/types"

interface EmailHeaderProps {
  title: string
  folder: EmailFolder
}

export function EmailHeader({ title, folder }: EmailHeaderProps) {
  const {
    selectedEmail,
    getCurrentFolderEmails,
    moveToTrash,
    markAsRead,
  } = useEmail()

  const handleRefresh = () => {
    // In a real app, this would refresh emails from the server.
    console.log("Refreshing emails")
  }

  const handleDelete = () => {
    // This example uses the selected email for deletion.
    if (selectedEmail && selectedEmail.folder === folder) {
      moveToTrash([selectedEmail.id])
    }
  }

  const handleMarkAsRead = () => {
    if (selectedEmail && selectedEmail.folder === folder) {
      markAsRead([selectedEmail.id], true)
    }
  }

  const handleMarkAsUnread = () => {
    if (selectedEmail && selectedEmail.folder === folder) {
      markAsRead([selectedEmail.id], false)
    }
  }

  // When an email is selected in the current folder, show the email detail header.
  if (selectedEmail && selectedEmail.folder === folder) {
    return (
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">{selectedEmail.subject}</h1>
          <p className="text-sm text-gray-400">{selectedEmail.sender.name}</p>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh">
            <RefreshCcw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleMarkAsRead} title="Mark as read">
            <MailOpen className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleMarkAsUnread} title="Mark as unread">
            <MailX className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </header>
    )
  }

  // Otherwise, show the folder header with the folder title.
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh">
          <RefreshCcw className="h-5 w-5" />
        </Button>
        {/* Optionally, you can add folder-level actions here */}
      </div>
    </header>
  )
}
