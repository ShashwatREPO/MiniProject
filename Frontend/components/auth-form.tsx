"use client"

import type React from "react"

import { useState } from "react"
// No need for useRouter here if AuthProvider handles redirection
// import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context" // Ensure this path is correct
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"

export function AuthForm() {
  // Local loading state can be used for UI feedback before API call starts,
  // but the context's isLoading reflects the actual API call duration.
  // const [isSubmitting, setIsSubmitting] = useState(false); // Optional local state
  const [showPassword, setShowPassword] = useState(false)
  // const router = useRouter(); // Remove if redirection is handled in useAuth
  const { login, register, isLoading } = useAuth() // Get isLoading from context

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // setIsSubmitting(true); // Optional: set local state immediately

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login(email, password)
      // No need to redirect here if login function in useAuth handles it
      // router.push("/inbox");
    } catch (error) {
      console.error("Login failed in component:", error)
      // TODO: Display user-friendly error message (e.g., using state and rendering an alert)
      alert((error as Error).message || "Login failed. Please try again.")
    } finally {
      // setIsSubmitting(false); // Optional: reset local state
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // setIsSubmitting(true); // Optional

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string // Matches form input name
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // Pass 'name' which will be mapped to 'fullName' in the register function
      await register(name, email, password)
      // No need to redirect here if register function in useAuth handles it (e.g., by calling login)
      // router.push("/inbox");
    } catch (error) {
      console.error("Registration failed in component:", error)
      // TODO: Display user-friendly error message
      alert(
        (error as Error).message || "Registration failed. Please try again."
      )
    } finally {
      // setIsSubmitting(false); // Optional
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <form onSubmit={handleLogin} className="space-y-4">
          {/* ... (Email input - no changes needed) ... */}
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="login-email"
                name="email"
                type="email"
                className="pl-10"
                placeholder="your@email.com"
                required
                disabled={isLoading} // Disable input during API call
              />
            </div>
          </div>
          {/* ... (Password input - no changes needed) ... */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="••••••••"
                required
                disabled={isLoading} // Disable input during API call
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
                disabled={isLoading} // Disable toggle during API call
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {/* Use context's isLoading for button state */}
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="register">
        <form onSubmit={handleRegister} className="space-y-4">
          {/* ... (Name input - no changes needed) ... */}
          <div className="space-y-2">
            <Label htmlFor="register-name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="register-name"
                name="name" // Keep name="name" here
                className="pl-10"
                placeholder="Your Name"
                required
                disabled={isLoading} // Disable input during API call
              />
            </div>
          </div>
          {/* ... (Email input - no changes needed) ... */}
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="register-email"
                name="email"
                type="email"
                className="pl-10"
                placeholder="your@email.com"
                required
                disabled={isLoading} // Disable input during API call
              />
            </div>
          </div>
          {/* ... (Password input - no changes needed) ... */}
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="••••••••"
                required
                disabled={isLoading} // Disable input during API call
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
                disabled={isLoading} // Disable toggle during API call
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {/* Use context's isLoading for button state */}
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
