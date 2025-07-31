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
        <div className="flex items-center justify-around px-4 py-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto p-2">
              <Home className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center space-y-1 h-auto p-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="text-xs">Filters</span>
          </Button>

          <Link href="/sell">
            <Button 
              size="sm" 
              className="flex flex-col items-center space-y-1 h-auto p-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">Sell</span>
            </Button>
          </Link>

          <Link href="/messages">
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto p-2">
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

  // Desktop sidebar
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-4">
        <Button 
          onClick={onCreateListing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create new listing
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableLocations.map((location) => (
                <Button
                  key={location.name}
                  variant={selectedLocation === location.name ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleLocationSelect(location.name)}
                >
                  {location.name}
                  {location.region && (
                    <span className="ml-2 text-xs text-gray-500">({location.region})</span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function MarketplaceSidebar(props: MarketplaceBottomNavProps) {
  return <MarketplaceBottomNav {...props} />
}