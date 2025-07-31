"use client"

import React, { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { auth } from '@/app/firebase'
import { ChatInterface } from '@/components/chat-interface'
import { MarketplaceNav } from '@/components/marketplace-nav'
import { MarketplaceBottomNav } from '@/components/marketplace-sidebar'

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50">
      <MarketplaceNav 
        user={user} 
        isMobile={isMobile}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-200">
            <ChatInterface
              currentUserId={user.uid}
              currentUserName={user.displayName || user.email || 'User'}
              isOpen={true}
              onClose={() => router.push('/')}
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