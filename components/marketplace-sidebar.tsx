"use client"

import React, { useState } from 'react'
import { MapPin, Filter, Grid3X3, List, Plus, Search, X, Navigation, Clock, TrendingUp } from 'lucide-react'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

interface MarketplaceSidebarProps {
  selectedCategory: string
  categories: string[]
  onCategoryChange: (category: string) => void
  onCreateListing?: () => void
  // Added missing props
  selectedLocation?: string
  onLocationChange?: (location: string) => void
}

// Available locations with regions
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

export function MarketplaceSidebar({
  selectedCategory,
  categories,
  onCategoryChange,
  onCreateListing,
  selectedLocation = "All Locations", // Added default value
  onLocationChange = () => {} // Added default function
}: MarketplaceSidebarProps) {
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [locationSearchTerm, setLocationSearchTerm] = useState("")

  const filteredLocations = availableLocations.filter(location =>
    location.name.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
    location.region.toLowerCase().includes(locationSearchTerm.toLowerCase())
  )

  const handleLocationSelect = (location: string) => {
    onLocationChange(location)
    setShowLocationSearch(false)
    setLocationSearchTerm("")
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For this demo, we'll just pick a random location
          // In a real app, you'd reverse geocode the coordinates
          const randomLocation = availableLocations[Math.floor(Math.random() * (availableLocations.length - 1)) + 1]
          handleLocationSelect(randomLocation.name)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please select manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Create listing button */}
          <Button 
            onClick={onCreateListing}
            className="flex flex-col items-center space-y-1 h-auto p-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs">Sell</span>
          </Button>

          {/* Location filter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto p-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Location</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                {/* Current location button */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={getCurrentLocation}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Use current location
                </Button>

                {/* Location search/select */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowLocationSearch(!showLocationSearch)}
                  >
                    <span className="truncate">
                      {selectedLocation || "Select location"}
                    </span>
                    <Search className="w-4 h-4 ml-2" />
                  </Button>

                  {showLocationSearch && (
                    <div className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {/* Search input */}
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="text"
                            placeholder="Search locations..."
                            value={locationSearchTerm}
                            onChange={(e) => setLocationSearchTerm(e.target.value)}
                            className="pl-10 pr-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            autoFocus
                          />
                          {locationSearchTerm && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                              onClick={() => setLocationSearchTerm("")}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Location options */}
                      <div className="py-1">
                        {filteredLocations.map((location) => (
                          <button
                            key={location.name}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors ${
                              selectedLocation === location.name ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'dark:text-gray-100'
                            }`}
                            onClick={() => handleLocationSelect(location.name)}
                          >
                            <div>
                              <div className="font-medium">{location.name}</div>
                              {location.region && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{location.region} region</div>
                              )}
                            </div>
                            {selectedLocation === location.name && (
                              <Badge variant="secondary" className="ml-2">✓</Badge>
                            )}
                          </button>
                        ))}

                        {filteredLocations.length === 0 && (
                          <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                            No locations found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clear location filter */}
                {selectedLocation !== "All Locations" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => handleLocationSelect("All Locations")}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear location
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Category filter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto p-2">
                <Filter className="w-4 h-4" />
                <span className="text-xs">Category</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh]">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Category
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-2 mt-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className={`w-full justify-start transition-colors ${
                      selectedCategory === category 
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => onCategoryChange(category)}
                  >
                    {category}
                    {selectedCategory === category && (
                      <Badge variant="secondary" className="ml-auto dark:bg-blue-800 dark:text-blue-100">
                        ✓
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Quick filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto p-2">
                <List className="w-4 h-4" />
                <span className="text-xs">Sort</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[40vh]">
              <SheetHeader>
                <SheetTitle>Quick filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-3 mt-4">
                <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Clock className="w-4 h-4 mr-2" />
                  Recently listed
                </Button>
                <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <List className="w-4 h-4 mr-2" />
                  Price: Low to high
                </Button>
                <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Most popular
                </Button>
                <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Featured listings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}