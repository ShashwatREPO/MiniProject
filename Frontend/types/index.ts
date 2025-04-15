export interface User {
  name: string
  email: string
  avatar?: string
}

export type EmailFolder = "inbox" | "sent" | "trash"

export interface Email {
  id: string
  sender: User & { avatar: string }
  recipient?: User
  subject: string
  preview: string
  body: string
  timestamp: string
  read: boolean
  folder: EmailFolder
  labels?: string[]
}
