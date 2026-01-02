"use client"

import React, { useState } from 'react'
import { MapPin, Filter, Grid3X3, List, Plus, Search, X, Navigation, Clock, TrendingUp, Home, User, MessageCircle, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

interface MarketplaceBottomNavProps {
  selectedCategory: string
  categories: string[]
  onCategoryChange: (category: string) => void
  onCreateListing?: () => void
  selectedLocation?: string
  onLocationChange?: (location: string) => void
  onLocationPopupOpen?: () => void
  onDetectLocation?: () => void
  user?: any
  isMobile?: boolean
}

// Available locations
const availableLocations = [
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

export function MarketplaceBottomNav({
  selectedCategory,
  categories,
  onCategoryChange,
  onCreateListing,
  selectedLocation = "All Locations",
  onLocationChange = () => {},
  onLocationPopupOpen,
  onDetectLocation,
  user,
  isMobile = false
}: MarketplaceBottomNavProps) {
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [locationSearchTerm, setLocationSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  const filteredLocations = availableLocations.filter(location =>
    location.name.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
    location.region.toLowerCase().includes(locationSearchTerm.toLowerCase())
  )

  const handleLocationSelect = (location: string) => {
    onLocationChange(location)
    setShowLocationSearch(false)
    setLocationSearchTerm("")
  }

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around px-2 py-1">
          <Link href="/">
            <Button variant="ghost" size="mobile" className="flex flex-col items-center space-y-1 h-auto py-2 px-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[60px] min-w-[60px] touch-manipulation">
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="mobile" 
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[60px] min-w-[60px] touch-manipulation"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
            <span className="text-xs font-medium">Filters</span>
          </Button>

          <Link href="/sell">
            <Button 
              size="mobile" 
              className="flex flex-col items-center space-y-1 h-auto py-2 px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white min-h-[60px] min-w-[60px] touch-manipulation"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">Sell</span>
            </Button>
          </Link>

          <Link href="/messages">
            <Button variant="ghost" size="mobile" className="flex flex-col items-center space-y-1 h-auto py-2 px-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[60px] min-w-[60px] touch-manipulation">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Messages</span>
            </Button>
          </Link>

          <Link href="/profile">
            <Button variant="ghost" size="mobile" className="flex flex-col items-center space-y-1 h-auto py-2 px-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[60px] min-w-[60px] touch-manipulation">
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </Button>
          </Link>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Location</h3>
                <Button
                  variant="outline"
                  className="w-full justify-between text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setShowLocationSearch(!showLocationSearch)}
                >
                  <span className="truncate">{selectedLocation}</span>
                  <Search className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Category</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${
                        selectedCategory === category 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => onCategoryChange(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop horizontal bar below navbar
  return (
    <div className="w-full bg-white dark:bg-black border-b border-white dark:border-white sticky top-14 md:top-16 z-40">
      <div className="container max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">

          {/* Categories Dropdown */}
<div className="flex items-center mx-4">
  <div className="relative">
    <button
      className="flex items-center space-x-2 px-3 md:px-4 py-2 text-sm md:text-base bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] touch-manipulation"
      onClick={() => setDropdownOpen(!dropdownOpen)}
    >
      <span className="text-gray-700">{selectedCategory === "All" ? "Categories" : selectedCategory}</span>
      <ChevronDown 
        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
          dropdownOpen ? 'rotate-180' : ''
        }`} 
      />
    </button>
    
    {dropdownOpen && (
      <div className="absolute top-full left-0 mt-1 w-full min-w-max bg-white border border-gray-200 rounded-md shadow-lg z-50">
        <div className="py-1">
          {categories.map((category) => (
            <button
              key={category}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                selectedCategory === category 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700'
              }`}
              onClick={() => {
                onCategoryChange(category);
                setDropdownOpen(false);
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

          {/* Location Selector */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm border-gray-300 hover:border-gray-400"
              onClick={() => setShowLocationSearch(!showLocationSearch)}
            >
              <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline truncate max-w-24 md:max-w-32">
                {selectedLocation}
              </span>
              <span className="sm:hidden">Location</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm border-gray-300 hover:border-gray-400"
              onClick={onDetectLocation}
            >
              Auto-detect
            </Button>
          </div>
        </div>

        {/* Location Search Dropdown */}
        {showLocationSearch && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-64 overflow-y-auto rounded-md">
            <div className="p-3">
              {onLocationPopupOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-3 text-sm border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => {
                    onLocationPopupOpen()
                    setShowLocationSearch(false)
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Detect My Location
                </Button>
              )}
              <Input
                placeholder="Search locations..."
                value={locationSearchTerm}
                onChange={(e) => setLocationSearchTerm(e.target.value)}
                className="mb-3 text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <div className="space-y-1">
                {filteredLocations.map((location) => (
                  <Button
                    key={location.name}
                    variant="ghost"
                    className="w-full justify-start text-sm h-8 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleLocationSelect(location.name)}
                  >
                    {location.name}
                    {location.region && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({location.region})</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function MarketplaceSidebar(props: MarketplaceBottomNavProps) {
  return <MarketplaceBottomNav {...props} />
}