"use client"

import React, { useState } from 'react'
import { MapPin, Filter, Grid3X3, List, Plus, Search, X, Navigation, Clock, TrendingUp, Home, User, MessageCircle } from 'lucide-react'
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
  user,
  isMobile = false
}: MarketplaceBottomNavProps) {
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [locationSearchTerm, setLocationSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-white border-t border-gray-200 dark:border-gray-200">
        <div className="flex items-center justify-around px-2 py-1">
          <Link href="/">
            <Button variant="ghost" size="mobile" className="flex flex-col items-center space-y-1 h-auto py-2 px-3">
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="mobile" 
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
            <span className="text-xs font-medium">Filters</span>
          </Button>

          <Link href="/sell">
            <Button 
              size="mobile" 
              className="flex flex-col items-center space-y-1 h-auto py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">Sell</span>
            </Button>
          </Link>

          <Link href="/messages">
            <Button variant="ghost" size="mobile" className="flex flex-col items-center space-y-1 h-auto py-2 px-3">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Messages</span>
            </Button>
          </Link>

          <Link href="/profile">
            <Button variant="ghost" size="mobile" className="flex flex-col items-center space-y-1 h-auto py-2 px-3">
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </Button>
          </Link>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Location</h3>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowLocationSearch(!showLocationSearch)}
                >
                  <span className="truncate">{selectedLocation}</span>
                  <Search className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Category</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${
                        selectedCategory === category 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700'
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
    <div className="w-full bg-white border-b border-gray-200 sticky top-14 md:top-16 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Create Listing Button */}
          <Button 
            onClick={onCreateListing}
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm"
            size="sm"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Create Listing
          </Button>

          {/* Categories */}
          <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto flex-1 mx-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                className={`whitespace-nowrap h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm ${
                  selectedCategory === category 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Location Selector */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm border-gray-300 hover:border-gray-400"
              onClick={() => setShowLocationSearch(!showLocationSearch)}
            >
              <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline truncate max-w-24 md:max-w-32">
                {selectedLocation}
              </span>
              <span className="sm:hidden">Location</span>
            </Button>
          </div>
        </div>

        {/* Location Search Dropdown */}
        {showLocationSearch && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50 max-h-64 overflow-y-auto">
            <div className="p-3">
              <Input
                placeholder="Search locations..."
                value={locationSearchTerm}
                onChange={(e) => setLocationSearchTerm(e.target.value)}
                className="mb-3 text-sm"
              />
              <div className="space-y-1">
                {filteredLocations.map((location) => (
                  <Button
                    key={location.name}
                    variant="ghost"
                    className="w-full justify-start text-sm h-8"
                    onClick={() => handleLocationSelect(location.name)}
                  >
                    {location.name}
                    {location.region && (
                      <span className="ml-2 text-xs text-gray-500">({location.region})</span>
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