// src/context/AuthContext.tsx (or .js if not using TypeScript)
"use client"

import type React from "react"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"

// --- User Interface (Aligned with Backend) ---
interface User {
  id: string
  fullName: string // Changed from name to match backend
  email: string
}

// --- Context Type Definition ---
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

// --- Create Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// --- localStorage Keys ---
const AUTH_TOKEN_KEY = "authToken"
const USER_INFO_KEY = "userInfo"

// --- AuthProvider Component ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true until check is done
  const router = useRouter()

  // --- Helper to Fetch User Data (using token) ---
  const fetchUserWithToken = useCallback(
    async (currentToken: string): Promise<User | null> => {
      if (!currentToken) return null

      setIsLoading(true) // Set loading true when fetching user
      try {
        // CORRECTED ENDPOINT: Use the profile route from your backend
        const response = await fetch("https:/localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const userData = await response.json() // Expects { id, email, fullName, ... }
          // Format data to match frontend User interface
          const formattedUser: User = {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
          }
          setUser(formattedUser)
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(formattedUser))
          return formattedUser
        } else {
          // Token invalid or other error
          console.error("Failed to fetch user data:", response.status)
          // Clear invalid token/user data
          setToken(null)
          setUser(null)
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem(USER_INFO_KEY)
          return null
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        // Clear state on network/parsing errors
        setToken(null)
        setUser(null)
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_INFO_KEY)
        return null
      } finally {
        setIsLoading(false) // Ensure loading is set to false after fetch attempt
      }
    },
    [] // This function itself doesn't depend on changing state/props
  )

  // --- Effect for Initial Authentication Check ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true) // Start loading
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)

      if (storedToken) {
        setToken(storedToken)
        // RECOMMENDED: Always re-fetch user data using the token for consistency
        await fetchUserWithToken(storedToken)
      }
      // If no token, fetchUserWithToken won't run, so set loading false here
      setIsLoading(false)
    }

    checkAuthStatus()
    // Include fetchUserWithToken in dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserWithToken])

  // --- Login Function ---
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      try {
        // CORRECTED ENDPOINT
        const response = await fetch("https://localhost:5000/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          // Status 200 OK
          const data = await response.json() // Expect { token, user: { id, email, fullName } }
          const receivedToken = data.token
          const receivedUser = data.user

          if (!receivedToken || !receivedUser) {
            throw new Error(
              "Login successful but token or user data missing in response."
            )
          }

          // Format received user data
          const formattedUser: User = {
            id: receivedUser.id,
            fullName: receivedUser.fullName,
            email: receivedUser.email,
          }

          setToken(receivedToken)
          setUser(formattedUser) // Set user directly from login response
          localStorage.setItem(AUTH_TOKEN_KEY, receivedToken)
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(formattedUser))

          router.push("/inbox") // Redirect after successful login
        } else if (response.status === 401) {
          // CORRECTED STATUS: 401 Unauthorized for invalid credentials
          const errorData = await response.json().catch(() => ({}))
          console.error("Login failed: Invalid credentials", errorData)
          throw new Error(errorData.message || "Invalid email or password")
        } else {
          // Handle other non-OK responses
          const errorData = await response.json().catch(() => ({}))
          console.error(
            "Login failed:",
            response.status,
            response.statusText,
            errorData
          )
          throw new Error(
            errorData.message || `Login failed: ${response.statusText}`
          )
        }
      } catch (error) {
        console.error("An error occurred during login:", error)
        // Clear state on error
        setToken(null)
        setUser(null)
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_INFO_KEY)
        throw error // Re-throw for component-level handling
      } finally {
        setIsLoading(false)
      }
    },
    [router] // Dependency: router
  )

  // --- Register Function ---
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true)
      try {
        // CORRECTED ENDPOINT
        const response = await fetch("https:/localhost:5000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Backend expects 'fullName'
          body: JSON.stringify({ email, password, fullName: name }),
        })

        if (response.status === 201) {
          // CORRECTED STATUS: 201 Created for successful registration
          console.log("Registration successful")
          // Automatically log in the user after successful registration
          await login(email, password)
          // login function handles setting state, storage, loading, and redirection
        } else if (response.status === 400) {
          // Bad Request (e.g., user exists, validation error)
          const errorData = await response.json().catch(() => ({}))
          console.error("Registration failed: Bad request", errorData)
          throw new Error(
            errorData.message || "Registration failed. User might already exist."
          )
        } else {
          // Handle other non-OK responses
          const errorData = await response.json().catch(() => ({}))
          console.error(
            "Registration failed:",
            response.status,
            response.statusText,
            errorData
          )
          throw new Error(
            errorData.message || `Registration failed: ${response.statusText}`
          )
        }
      } catch (error) {
        console.error("An error occurred during registration:", error)
        // If registration fails before login is called, ensure loading is reset
        setIsLoading(false)
        throw error // Re-throw for component-level handling
      }
      // No finally block needed here if login() handles the final setIsLoading(false) on success path
    },
    [login] // Dependency: login function
  )

  // --- Logout Function ---
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
    // Redirect to login page (adjust '/auth' if your route is different)
    router.push("/auth")
  }, [router]) // Dependency: router

  // --- Context Value ---
  const value = { user, token, login, register, logout, isLoading }

  // --- Provide Context ---
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// --- Hook to Use Auth Context ---
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
