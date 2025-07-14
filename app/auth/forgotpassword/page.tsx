"use client"

import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/firebase"
import { Input } from "@components/ui/input"
import { Button } from "@components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import Link from "next/link"


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage("Password reset email sent. Check your inbox.")
    } catch (err) {
      const errorCode = (err as any)?.code
      if (errorCode === "auth/user-not-found") {
        setError("No account found with this email.")
      } else if (errorCode === "auth/invalid-email") {
        setError("Please enter a valid email.")
      } else {
        setError("Failed to send reset email.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Email"}
            </Button>
            <div className="mt-4 text-center">
                <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
                 ← Back to Login
                 </Link>
                 </div>

            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


