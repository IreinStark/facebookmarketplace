"use client"

import type React from "react"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/firebase" // Make sure this file exists and is correctly configured

import { useState } from "react"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Separator } from "@components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setIsLoading(false)
      router.push("/")
    } catch (err) {
      setIsLoading(false);
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as any).code === "string"
      ) {
        const code = (err as { code: string; message?: string }).code;
        if (
          code === "auth/wrong-password" ||
          code === "auth/invalid-credential" ||
          code === "auth/user-not-found"
        ) {
          setError("Incorrect email or password.");
        } else if (code === "auth/invalid-email") {
          setError("Please enter a valid email address.");
        } else if (code === "auth/user-disabled") {
          setError("This account has been disabled.");
        } else {
          setError("Login failed. " + ((err as { message?: string }).message || ""));
        }
      } else {
        setError("Login failed. An unknown error occurred.");
      }
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      localStorage.setItem("isLoggedIn", "true")
      router.push("/")
    } catch (err) {
      setError("Google sign-in failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-2 sm:p-4">
      <Card className="w-full max-w-md mx-2 sm:mx-4">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">Welcome Back</CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">Sign in to your account</p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm sm:text-base h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-sm sm:text-base h-10 sm:h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 sm:h-11 w-10 sm:w-11"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
               <div className="text-right text-sm">
                <Link href="/auth/forgotpassword" className="text-blue-600 hover:underline">
                Forgot password?
                </Link>
                </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading} size="lg">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="space-y-3 sm:space-y-4">
            <Button
              variant="outline"
              className="w-full h-10 sm:h-11"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full h-10 sm:h-11" size="lg" disabled>
              Continue with Facebook
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
