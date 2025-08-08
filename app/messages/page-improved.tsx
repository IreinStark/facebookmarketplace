"use client"

import React, { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"

import { auth } from "@/app/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, MessageCircle, Plus } from 'lucide-react'
import Link from 'next/link'

import { MarketplaceNav } from '@/components/marketplace-nav'
import { MarketplaceBottomNav } from '@/components/marketplace-sidebar'
import { ChatInterface } from '@/components/chat-interface'

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/auth/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="mt-4 text-gray-600 dark:text-white">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <MarketplaceNav 
        user={user}
        isMobile={isMobile}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Improved Header with Back to Homepage Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] touch-manipulation">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Homepage</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ChatInterface 
              isOpen={true} 
              onClose={() => {}} 
              currentUserId={user?.uid || ''} 
              currentUserName={user?.displayName || user?.email?.split('@')[0] || 'User'}
            />
          </div>
        </div>
      </div>

      {isMobile && (
        <MarketplaceBottomNav
          selectedCategory="All"
          categories={["All", "Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden", "Automotive", "Other"]}
          onCategoryChange={() => {}}
          onCreateListing={() => router.push('/sell')}
          selectedLocation="All Locations"
          onLocationChange={() => {}}
          user={user}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}