"use client"

import React, { useState, useEffect } from 'react'
import { Search, MessageCircle, Bell, User, ShoppingBag, Menu, MapPin, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useTheme } from 'next-themes'

// Location data
const locations = [
  { name: "All Locations", region: "" },
  { name: "Lefkosa", region: "Central" },
  { name: "Girne", region: "Northern" },
  { name: "Famagusta", region: "Eastern" },
  { name: "Iskele", region: "Eastern" },
  { name: "Guzelyurt", region: "Western" },
  { name: "Lapta", region: "Northern" },
  { name: "Alsancak", region: "Northern" },
  { name: "Catalkoy", region: "Northern" },
  { name: "Esentepe", region: "Northern" },
  { name: "Bogaz", region: "Northern" },
  { name: "Dipkarpaz", region: "Karpaz" },
  { name: "Yeni Iskele", region: "Eastern" },
]

interface MarketplaceNavProps {
  user?: {
    displayName?: string
    photoURL?: string
    email?: string
  } | null
  onSearch?: (query: string) => void
  onLocationChange?: (location: string) => void
  searchValue?: string
  selectedLocation?: string
}

export function MarketplaceNav({ 
  user, 
  onSearch, 
  onLocationChange, 
  searchValue, 
  selectedLocation = "All Locations" 
}: MarketplaceNavProps) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const { theme } = useTheme()

  // Filter locations based on search
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
    location.region.toLowerCase().includes(locationSearch.toLowerCase())
  )

  const handleLocationSelect = (location: string) => {
    onLocationChange?.(location)
    setShowLocationDropdown(false)
    setLocationSearch("")
  }

  const clearLocation = () => {
    onLocationChange?.("All Locations")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.location-dropdown')) {
        setShowLocationDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left section - Logo and Marketplace */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-white transition-colors">

                Local Market
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">

                Marketplace
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">

                Local community buying & selling
              </p>
            </div>
          </div>
        </div>

        {/* Center section - Search and Location */}
        <div className="flex-1 max-w-2xl mx-4 space-y-2 md:space-y-0 md:flex md:space-x-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search Marketplace"
              value={searchValue || ''}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full focus:bg-white dark:focus:bg-gray-700 focus:shadow-md transition-all"
            />
          </div>

          {/* Location Filter */}
          <div className="relative location-dropdown">
            <Button
              variant="outline"
              className="w-full md:w-auto justify-start bg-gray-100 dark:bg-gray-800 border-none rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              <span className="truncate max-w-32">
                {selectedLocation}
              </span>
              {selectedLocation !== "All Locations" && (
                <X 
                  className="w-4 h-4 ml-2 hover:text-red-500" 
                  onClick={(e) => {
                    e.stopPropagation()
                    clearLocation()
                  }}
                />
              )}
            </Button>

            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 md:left-auto md:right-auto md:w-72 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <Input
                    type="text"
                    placeholder="Search locations..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredLocations.map((location) => (
                    <button
                      key={location.name}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
                      onClick={() => handleLocationSelect(location.name)}
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {location.name}
                        </div>
                        {location.region && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {location.region} Region
                          </div>
                        )}
                      </div>
                      {selectedLocation === location.name && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section - User actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <Bell className="w-5 h-5" />
            </Button>
          </div>

          {/* User profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback>
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>Your listings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}