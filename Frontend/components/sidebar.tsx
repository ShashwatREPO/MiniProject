"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Archive,
  ArchiveX,
  ChevronDown,
  Clock,
  Inbox,
  LogOut,
  MoreHorizontal,
  PenSquare,
  Search,
  Send,
  Settings,
  Star,
  Tag,
  Trash2,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useEmail } from "@/context/email-context"

interface SidebarProps {
  onCompose: () => void
}

export function Sidebar({ onCompose }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { setSearchQuery, searchQuery, emails } = useEmail()
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)

  // Count unread emails
  const unreadCount = emails.filter((email) => email.folder === "inbox" && !email.read).length

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedSearchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [debouncedSearchQuery, setSearchQuery])

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-64 h-screen bg-black border-r border-gray-800 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Mail</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCompose}
          className="hover:bg-blue-600/10 hover:text-blue-500 transition-colors"
        >
          <PenSquare className="h-5 w-5" />
          <span className="sr-only">Compose</span>
        </Button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search mail"
            className="pl-10 bg-gray-900 border-gray-700 focus-visible:ring-blue-500"
            value={debouncedSearchQuery}
            onChange={(e) => setDebouncedSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <TooltipProvider delayDuration={300}>
          <ul className="space-y-1 p-2">
            <li>
              <Link href="/inbox">
                <Button
                  variant={isActive("/inbox") ? "default" : "ghost"}
                  className={`w-full justify-between ${isActive("/inbox") ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-800"}`}
                >
                  <div className="flex items-center">
                    <Inbox className="h-4 w-4 mr-4" />
                    <span>Inbox</span>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-blue-500 hover:bg-blue-600">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/sent">
                <Button
                  variant={isActive("/sent") ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive("/sent") ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-800"}`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Sent
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/trash">
                <Button
                  variant={isActive("/trash") ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive("/trash") ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-800"}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Trash
                </Button>
              </Link>
            </li>
          </ul>
        </TooltipProvider>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-gray-800">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Account</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
        
            <DropdownMenuItem onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
