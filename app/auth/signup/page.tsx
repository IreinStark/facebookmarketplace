"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Separator } from "@components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { serverTimestamp } from "firebase/firestore";

// Import Firebase Auth & Firestore
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { auth, db } from "@/app/firebase" // Adjust the path as needed
import { createNotification } from "@/lib/firebase-utils"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!")
      return
    }

    setIsLoading(true)
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      // Save extra user info to Firestore
      await setDoc(doc(db, "userProfiles", userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        uid: userCredential.user.uid,
        createdAt: serverTimestamp()
      })

      // Create welcome notification with proper error handling
      try {
        await createNotification({
          type: 'system',
          title: 'Welcome to Local Marketplace!',
          message: `Your account has been created successfully, ${formData.firstName}!`,
          userId: userCredential.user.uid
        })
        console.log('Welcome notification created for signup user');
      } catch (notificationError) {
        // Don't fail signup if notification creation fails
        console.error('Failed to create welcome notification:', notificationError);
        // Continue with signup flow
      }

      setIsLoading(false)
      router.push("/")
    } catch (err) {
      setIsLoading(false);
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string"
      ) {
        const code = (err as { code: string; message?: string }).code;
        if (code === "auth/invalid-email") {
          setError("Please enter a valid email address.");
        } else if (code === "auth/email-already-in-use") {
          setError("This email is already registered.");
        } else {
          setError((err as { message?: string }).message || "An error occurred.");
        }
      } else {
        setError("An unknown error occurred.");
      }
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      if (result && result.user) {
        await setDoc(
          doc(db, "userProfiles", result.user.uid),
          {
            firstName: result.user.displayName?.split(" ")[0] || "",
            lastName: result.user.displayName?.split(" ")[1] || "",
            email: result.user.email,
            displayName: result.user.displayName || 'Anonymous User',
            uid: result.user.uid,
            createdAt: serverTimestamp()
          },
          { merge: true }
        )
        
        // Create welcome notification with proper error handling
        try {
          await createNotification({
            type: 'system',
            title: 'Welcome to Local Marketplace!',
            message: `Your account has been created successfully, ${result.user.displayName || 'User'}!`,
            userId: result.user.uid
          })
          console.log('Welcome notification created for Google signup user');
        } catch (notificationError) {
          // Don't fail signup if notification creation fails
          console.error('Failed to create welcome notification:', notificationError);
          // Continue with signup flow
        }
      }
      setIsLoading(false)
      router.push("/")
    } catch (err) {
      setIsLoading(false)
      console.error('Google signup error:', err)
      if (err instanceof Error) {
        setError(`Google sign-up failed: ${err.message}`)
      } else {
        setError("An unexpected error occurred during Google sign-up.")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-2 sm:p-4">
      <Card className="w-full max-w-md mx-2 sm:mx-4">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">Create Account</CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">Join your local marketplace</p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm sm:text-base">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm sm:text-base">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="text-sm sm:text-base h-10 sm:h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 sm:h-11 w-10 sm:w-11"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading} size="lg">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          </form>

          <Separator className="my-6" />

          <div className="space-y-3 sm:space-y-4">
            <Button
              variant="outline"
              className="w-full h-10 sm:h-11"
              size="lg"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
