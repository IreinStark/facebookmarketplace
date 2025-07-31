"use client"

import React, { useState } from 'react'
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Camera,
  MapPin,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { auth } from '@/app/firebase'

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
  onLocationChange,
  searchValue = '',
  selectedLocation = 'All Locations',
  onMenuClick,
  isMobile = false
}: MarketplaceNavProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [notifications] = useState(3) // Mock notification count

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-800/60">
      <div className="container flex h-14 md:h-16 items-center px-4">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="hidden sm:inline-block font-bold text-lg text-gray-900 dark:text-gray-100">
            Marketplace
          </span>
        </Link>

        {/* Desktop Search */}
        {!isMobile && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => onSearch?.(e.target.value)}
                className="pl-10 w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>
        )}

        {/* Desktop Location Badge */}
        {!isMobile && selectedLocation !== 'All Locations' && (
          <Badge 
            variant="secondary" 
            className="mr-4 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          >
            <MapPin className="w-3 h-3 mr-1" />
            {selectedLocation}
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Quick Actions for Desktop */}
          {!isMobile && (
            <>
              <Link href="/photos">
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Camera className="w-4 h-4 mr-2" />
                  Photos
                </Button>
              </Link>

              <Link href="/sell">
                <Button 
                  size="sm" 
                  className="hidden md:flex bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </Link>
            </>
          )}

          {user ? (
            <>
              {/* Messages */}
              <Link href="/messages">
                <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </Link>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.photoURL || '/placeholder-user.png'} 
                        alt={user.displayName || user.email} 
                      />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                  align="end" 
                  forceMount
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.displayName || 'User'}
                      </p>
                      <p className="w-[200px] truncate text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/sell" className="flex items-center cursor-pointer">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Create Listing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/photos" className="flex items-center cursor-pointer">
                      <Camera className="mr-2 h-4 w-4" />
                      <span>Photo Gallery</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="flex items-center cursor-pointer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Quick Actions Bar */}
      {isMobile && user && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2">
          <div className="flex items-center justify-around">
            <Link href="/sell">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto p-2">
                <Plus className="h-4 w-4" />
                <span className="text-xs">Sell</span>
              </Button>
            </Link>
            <Link href="/photos">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto p-2">
                <Camera className="h-4 w-4" />
                <span className="text-xs">Photos</span>
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto p-2 relative">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">Messages</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto p-2">
                <User className="h-4 w-4" />
                <span className="text-xs">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}