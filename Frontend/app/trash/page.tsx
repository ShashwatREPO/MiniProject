"use client"

import { EmailList } from "@/components/email-list"
import { EmailView } from "@/components/email-view"
import { EmailHeader } from "@/components/email-header"
import { useEmail } from "@/context/email-context"

export default function TrashPage() {
  const { getCurrentFolderEmails, selectedEmail } = useEmail()
  const emails = getCurrentFolderEmails("trash")

  return (
    <div className="flex flex-col h-full">
      <EmailHeader title="Trash" folder="trash" />
      <div className="flex flex-1 overflow-hidden">
        <EmailList emails={emails} />
        {selectedEmail && selectedEmail.folder === "trash" ? (
          <EmailView email={selectedEmail} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select an email to view its details.
          </div>
        )}
      </div>
    </div>
  )
}
