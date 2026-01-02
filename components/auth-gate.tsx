"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/app/firebase"

const AUTH_ROUTE_PREFIX = "/auth"

function isAuthRoute(pathname: string): boolean {
  return pathname === AUTH_ROUTE_PREFIX || pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`)
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setIsReady(true)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!isReady) return

    // Allow all auth pages without redirect
    if (isAuthRoute(pathname)) {
      if (user) {
        setRedirecting(true)
        router.replace("/")
      } else {
        setRedirecting(false)
      }
      return
    }

    // For non-auth pages, require authentication
    if (!user) {
      setRedirecting(true)
      router.replace("/auth/login")
      return
    }

    setRedirecting(false)
  }, [isReady, user, pathname, router])

  // Prevent flashing content while auth state is resolving or redirecting
  if (!isReady || redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking authentication…</p>
        </div>
      </div>
    )
  }

  // If on auth route, or authenticated, render children
  // Note: When unauthenticated on protected routes, router.replace will trigger; we still render nothing to avoid flash
  if (!user && !isAuthRoute(pathname)) {
    return null
  }

  return <>{children}</>
}


