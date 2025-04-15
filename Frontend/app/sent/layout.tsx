"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ComposeModal } from "@/components/compose-modal"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar onCompose={() => setIsComposeOpen(true)} />
      <div className="flex-1 overflow-hidden">{children}</div>
      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
    </div>
  )
}
