import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Reply, Forward, Star, Trash2, Archive, MoreVertical } from "lucide-react"
import type { Email } from "@/types"

interface EmailViewProps {
  email: Email | null
}

export function EmailView({ email }: EmailViewProps) {
  if (!email) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Select an email to view</h3>
          <p className="text-sm text-gray-400">Choose an email from the list to view its contents</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarFallback className="bg-blue-600/20 text-blue-500">
                {email.sender.avatar || email.sender.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{email.sender.name}</h2>
              <p className="text-sm text-gray-400">{email.recipient ? `To: ${email.recipient.name}` : "To: Me"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-400">{email.timestamp}</span>
            
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{email.subject}</h1>
          {email.labels && email.labels.length > 0 && (
            <div className="flex space-x-2 mb-4">
              {email.labels.map((label) => (
                <Badge key={label} variant="secondary" className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none">
          {email.body.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < paragraph.split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
        </div>

      
      </div>
    </div>
  )
}
