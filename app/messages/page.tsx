"use client"

import React, { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/app/firebase'
import { ChatInterface } from '@/components/chat-interface'
import { MarketplaceNav } from '@/components/marketplace-nav'
import { MarketplaceBottomNav } from '@/components/marketplace-sidebar'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import Link from 'next/link'

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get conversation parameters from URL
  const recipientId = searchParams.get('recipientId')
  const recipientName = searchParams.get('recipientName')
  const productId = searchParams.get('productId')
  const productTitle = searchParams.get('productTitle')

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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-white">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <MarketplaceNav 
        user={user} 
        isMobile={isMobile}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Back to Homepage</span>
            </Button>
          </Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ChatInterface
              currentUserId={user.uid}
              currentUserName={user.displayName || user.email || 'User'}
              isOpen={true}
              onClose={() => router.push('/')}
              initialRecipientId={recipientId || undefined}
              initialRecipientName={recipientName || undefined}
              productId={productId || undefined}
              productTitle={productTitle || undefined}
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