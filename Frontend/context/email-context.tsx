"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Email, EmailFolder } from "@/types"

// Sample email data remains the same.
const mockEmails: Email[] = [
  {
    id: "1",
    sender: {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      avatar: "A",
    },
    subject: "Welcome to Our Platform!",
    preview:
      "Hello, we're excited to have you onboard. Check out these tips to get started...",
    body: `Hi there,

Thank you for signing up for our service. We're excited to have you with us. Here are a few tips to help you get started...

Best,
The Team`,
    timestamp: "9:00 AM",
    read: false,
    folder: "inbox",
    labels: ["welcome"],
  },
  {
    id: "2",
    sender: {
      name: "Bob Smith",
      email: "bob.smith@company.com",
      avatar: "B",
    },
    subject: "Meeting Reminder: Tomorrow at 10 AM",
    preview:
      "Hi, just a reminder about tomorrow's meeting regarding the new project updates...",
    body: `Hello,

This is a friendly reminder about our meeting scheduled for tomorrow at 10 AM. Please review the attached agenda before joining.

Best regards,
Bob`,
    timestamp: "Yesterday",
    read: true,
    folder: "inbox",
    labels: ["work"],
  },
  {
    id: "3",
    sender: {
      name: "Charlie Davis",
      email: "charlie.davis@offers.com",
      avatar: "C",
    },
    subject: "Special Offer Just For You!",
    preview:
      "Don't miss out on this exclusive discount that expires soon – grab it now!",
    body: `Hi there,

We're excited to offer you an exclusive 50% discount on your next purchase. This offer is only valid for a limited time, so act fast!

Cheers,
Charlie`,
    timestamp: "2:15 PM",
    read: false,
    folder: "spam",
    labels: ["promotion"],
  },
  {
    id: "4",
    sender: {
      name: "Daisy Lee",
      email: "no-reply@newsletter.com",
      avatar: "D",
    },
    subject: "March Newsletter - What’s New?",
    preview:
      "Catch up on the latest news, features, and tips in this month’s newsletter...",
    body: `Dear Subscriber,

Welcome to the March edition of our newsletter. This month we’ve got exciting new updates and tips for you to explore!

Warm regards,
The Newsletter Team`,
    timestamp: "Mar 28",
    read: true,
    folder: "trash",
    labels: [],
  },
]

interface EmailContextType {
  emails: Email[]
  selectedEmails: string[]
  selectedEmail: Email | null
  setSelectedEmail: (email: Email | null) => void
  searchQuery: string
  filteredEmails: Email[]
  selectEmail: (email: Email) => void
  toggleSelectEmail: (emailId: string) => void
  selectAllEmails: (select: boolean) => void
  setSearchQuery: (query: string) => void
  moveToTrash: (emailIds: string[]) => void
  markAsRead: (emailIds: string[], read: boolean) => void
  moveToFolder: (emailIds: string[], folder: EmailFolder) => void
  getCurrentFolderEmails: (folder: EmailFolder) => Email[]
}

const EmailContext = createContext<EmailContextType | undefined>(undefined)

export function EmailProvider({ children }: { children: React.ReactNode }) {
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter emails based on search query.
  const filteredEmails = emails.filter((email) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    return (
      email.subject.toLowerCase().includes(query) ||
      email.sender.name.toLowerCase().includes(query) ||
      email.sender.email.toLowerCase().includes(query) ||
      email.preview.toLowerCase().includes(query)
    )
  })

  // Get emails for a specific folder.
  const getCurrentFolderEmails = useCallback(
    (folder: EmailFolder) => {
      return filteredEmails.filter((email) => email.folder === folder)
    },
    [filteredEmails],
  )

  // Select a single email to view and mark as read.
  const selectEmail = useCallback((email: Email) => {
    setSelectedEmail(email)
    if (!email.read) {
      setEmails((prevEmails) =>
        prevEmails.map((e) => (e.id === email.id ? { ...e, read: true } : e)),
      )
    }
  }, [])

  // Toggle selection for multi-select.
  const toggleSelectEmail = useCallback((emailId: string) => {
    setSelectedEmails((prevSelected) => {
      if (prevSelected.includes(emailId)) {
        return prevSelected.filter((id) => id !== emailId)
      } else {
        return [...prevSelected, emailId]
      }
    })
  }, [])

  // Select or deselect all emails in the current view.
  const selectAllEmails = useCallback(
    (select: boolean) => {
      if (select) {
        const currentFolderEmailIds = filteredEmails.map((email) => email.id)
        setSelectedEmails(currentFolderEmailIds)
      } else {
        setSelectedEmails([])
      }
    },
    [filteredEmails],
  )

  // Move emails to trash.
  const moveToTrash = useCallback((emailIds: string[]) => {
    setEmails((prevEmails) =>
      prevEmails.map((email) => (emailIds.includes(email.id) ? { ...email, folder: "trash" } : email)),
    )
    setSelectedEmails([])
  }, [])

  // Mark emails as read/unread.
  const markAsRead = useCallback((emailIds: string[], read: boolean) => {
    setEmails((prevEmails) =>
      prevEmails.map((email) => (emailIds.includes(email.id) ? { ...email, read } : email)),
    )
  }, [])

  // Move emails to a specific folder.
  const moveToFolder = useCallback((emailIds: string[], folder: EmailFolder) => {
    setEmails((prevEmails) =>
      prevEmails.map((email) => (emailIds.includes(email.id) ? { ...email, folder } : email)),
    )
    setSelectedEmails([])
  }, [])

  // Clear selection when search query changes.
  useEffect(() => {
    setSelectedEmails([])
  }, [searchQuery])

  return (
    <EmailContext.Provider
      value={{
        emails,
        selectedEmails,
        selectedEmail,
        setSelectedEmail, // Expose this setter to control the current email selection externally.
        searchQuery,
        filteredEmails,
        selectEmail,
        toggleSelectEmail,
        selectAllEmails,
        setSearchQuery,
        moveToTrash,
        markAsRead,
        moveToFolder,
        getCurrentFolderEmails,
      }}
    >
      {children}
    </EmailContext.Provider>
  )
}

export function useEmail() {
  const context = useContext(EmailContext)
  if (context === undefined) {
    throw new Error("useEmail must be used within an EmailProvider")
  }
  return context
}
