import { AuthForm } from "@/components/auth-form"

export default function Home() {
  // In a real app, you would check if the user is authenticated
  // and redirect to the inbox if they are
  // For demo purposes, we'll just show the auth form

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Email Client</h1>
        <AuthForm />
      </div>
    </main>
  )
}
