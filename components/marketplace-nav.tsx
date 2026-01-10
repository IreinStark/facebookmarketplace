"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  MessageCircle,
  MapPin,
  Sun,
  Moon,
  Plus,
  User,
  Settings,
  LogOut,
  Heart,
  Search
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { auth } from '@/app/firebase'
import { query, where, orderBy, collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/firebase'

interface MarketplaceNavProps {
  user?: any
  onSearch?: (searchTerm: string) => void
  onLocationChange?: (location: string) => void
  searchValue?: string
  selectedLocation?: string
  onMenuClick?: () => void
  isMobile?: boolean
}

export function MarketplaceNav({
  user,
  onSearch,
  searchValue = '',
  selectedLocation = 'All Locations',
  onMenuClick,
  isMobile = false
}: MarketplaceNavProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [notificationCount, setNotificationCount] = useState(0)

  // Fetch real notifications
  useEffect(() => {
    if (!auth.currentUser) {
      console.log('No authenticated user found for notification fetching');
      setNotificationCount(0);
      return;
    }

    const userId = auth.currentUser.uid;
    console.log('Setting up notification listener for user:', userId);

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('timestamp', 'desc')
      )

      const unsubscribe = onSnapshot(notificationsQuery, 
        (snapshot) => {
          const count = snapshot.docs.length;
          console.log(`Fetched ${count} unread notifications for user ${userId}`);
          setNotificationCount(count);
        }, 
        (error) => {
          console.error('Error fetching notifications:', {
            error,
            userId,
            errorCode: error.code,
            errorMessage: error.message
          });
          setNotificationCount(0);
        }
      )

      return () => {
        console.log('Cleaning up notification listener for user:', userId);
        unsubscribe();
      };
    } catch (setupError) {
      console.error('Error setting up notification listener:', {
        error: setupError,
        userId,
        errorCode: setupError.code,
        errorMessage: setupError.message
      });
      setNotificationCount(0);
      return () => {};
    }
  }, [])

  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out user');
      await auth.signOut()
      console.log('User signed out successfully');
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', {
        error,
        errorCode: error.code,
        errorMessage: error.message
      });
      // Still redirect even if sign out fails
      router.push('/auth/login')
    }
  }

  const handleLogoClick = () => {
    router.push('/')
  }

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo - Always visible */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">N</span>
            </div>
            <span className="hidden sm:inline-block font-bold text-base md:text-lg text-gray-900 dark:text-white">
              NEAR ME
            </span>
          </button>

          {/* Desktop Search - Hidden on mobile */}
          {!isMobile && (
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="pl-10 w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 bg-white dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 md:space-x-3 ml-auto whitespace-nowrap">
            {/* Theme Toggle - Always visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 md:w-9 md:h-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Desktop Quick Actions - Hidden on mobile */}
            {!isMobile && (
              <Link href="/sell">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 md:h-9 px-2 md:px-4 text-xs md:text-sm"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Sell
                </Button>
              </Link>
            )}

            {user ? (
              <>
                {/* Notifications - Always visible */}
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="relative w-8 h-8 md:w-9 md:h-9 p-0">
                    <Bell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Messages - Desktop only */}
                {!isMobile && (
                  <Link href="/messages">
                    <Button variant="ghost" size="sm" className="relative w-8 h-8 md:w-9 md:h-9 p-0">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {/* User Profile - Always visible */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full">
                      <Avatar className="h-7 w-7 md:h-8 md:w-8">
                        <AvatarImage 
                          src={user.photoURL || '/placeholder-user.png'} 
                          alt={user.displayName || user.email} 
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs md:text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    {/* Mobile Sell Button */}
                    {isMobile && (
                      <DropdownMenuItem asChild>
                        <Link href="/sell" className="flex items-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Sell Item
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Mobile Messages */}
                    {isMobile && (
                      <DropdownMenuItem asChild>
                        <Link href="/messages" className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Messages
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                    
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Login Button - Always visible */
              <Link href="/auth/login">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 md:h-9 px-3 md:px-6 text-xs md:text-sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}