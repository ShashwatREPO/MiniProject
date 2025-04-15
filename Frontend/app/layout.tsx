import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { EmailProvider } from "@/context/email-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Email Client",
  description: "Modern email client application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <EmailProvider>{children}</EmailProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'