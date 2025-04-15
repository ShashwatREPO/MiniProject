"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { Email } from "@/types"
import { useEmail } from "@/context/email-context"

interface EmailListProps {
  emails: Email[]
}

export function EmailList({ emails }: EmailListProps) {
  const { selectedEmail, selectEmail, selectedEmails, toggleSelectEmail } = useEmail()

  if (emails.length === 0) {
    return (
      <div className="w-full md:w-1/3 border-r border-gray-800 flex items-center justify-center p-8 text-gray-500">
        No emails found
      </div>
    )
  }

  return (
    <div className="w-full md:w-1/3 border-r border-gray-800 overflow-y-auto">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => {
            console.log("Email clicked:", email)
            selectEmail(email)
          }}
          className={`flex items-start p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors ${
            selectedEmail?.id === email.id ? "bg-red-500" : ""
          } ${!email.read ? "relative" : ""}`}
        >
          <div className="flex items-center mr-2 mt-1">
            
            {!email.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>}
          </div>

          <div className="flex-1 min-w-0 cursor-pointer">
            <div className="flex justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback className="bg-blue-600/20 text-blue-500">
                    {email.sender.avatar || email.sender.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className={`font-semibold truncate ${!email.read ? "font-bold" : ""}`}>
                  {email.sender.name}
                </h3>
              </div>
              <div className="flex items-center">
      
                <span className="text-xs text-gray-400 whitespace-nowrap">{email.timestamp}</span>
              </div>
            </div>
            <p className={`text-sm font-medium truncate mt-1 ${!email.read ? "font-bold" : ""}`}>
              {email.subject}
            </p>
            <div className="flex items-center mt-1">
              <p className="text-xs text-gray-400 truncate flex-1">{email.preview}</p>
              {email.labels && email.labels.length > 0 && (
                <div className="flex ml-2 space-x-1">
                  {email.labels.map((label) => (
                    <Badge key={label} variant="outline" className="text-xs px-1 py-0 h-5">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
