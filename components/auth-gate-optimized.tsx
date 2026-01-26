"use client"

import React, { useEffect, useState, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/app/firebase"

const AUTH_ROUTE_PREFIX = "/auth"

function isAuthRoute(pathname: string): boolean {
  return pathname === AUTH_ROUTE_PREFIX || pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`)
}

/**
 * Optimized AuthGate with performance improvements:
 * - Memoized route checks
 * - Reduced re-renders
 * - Better loading states
 * - Performance monitoring
 */
export function AuthGateOptimized({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  // Memoize route checks to prevent unnecessary recalculations
  const isAuthRouteMemo = useMemo(() => isAuthRoute(pathname), [pathname])
  const shouldRedirect = useMemo(() => {
    if (!isReady) return false
    if (isAuthRouteMemo && user) return true // Authenticated user on auth page
    if (!isAuthRouteMemo && !user) return true // Unauthenticated user on protected page
    return false
  }, [isReady, isAuthRouteMemo, user])

  useEffect(() => {
    const startTime = performance.now()
    let hasResolved = false

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!hasResolved) {
        const endTime = performance.now()
        const duration = endTime - startTime
        console.log(`🔥 Auth state resolved in: ${duration.toFixed(2)}ms`)
        hasResolved = true
      }
      
      setUser(nextUser)
      setIsReady(true)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!isReady || !shouldRedirect) return

    const performRedirect = async () => {
      setRedirecting(true)
      const redirectStartTime = performance.now()
      
      if (isAuthRouteMemo && user) {
        // Authenticated user on auth page -> redirect to home
        await router.replace("/")
      } else if (!isAuthRouteMemo && !user) {
        // Unauthenticated user on protected page -> redirect to login
        await router.replace("/auth/login")
      }
      
      const redirectEndTime = performance.now()
      const redirectDuration = redirectEndTime - redirectStartTime
      console.log(`🔄 Redirect completed in: ${redirectDuration.toFixed(2)}ms`)
      
      setRedirecting(false)
    }

    // Add small delay to prevent flickering
    const timeoutId = setTimeout(performRedirect, 50)
    return () => clearTimeout(timeoutId)
  }, [isReady, shouldRedirect, isAuthRouteMemo, user, router])

  // Optimized loading state with better UX
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border border-blue-200 dark:border-blue-800 animate-pulse mx-auto mb-4"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Loading…</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">This should only take a moment</p>
        </div>
      </div>
    )
  }

  // Redirecting state with animation
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-8 w-8 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Redirecting…</p>
        </div>
      </div>
    )
  }

  // If on auth route, or authenticated, render children
  if (!user && !isAuthRouteMemo) {
    return null // Don't render anything while redirecting
  }

  return <>{children}</>
}
