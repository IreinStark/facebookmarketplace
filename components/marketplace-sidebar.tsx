"use client"

import React, { useState } from 'react'
import { MapPin, Filter, Grid3X3, List, Plus, Search, X, Navigation } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Input } from './ui/input'

interface MarketplaceSidebarProps {
  selectedCategory: string
  selectedLocation: string
  priceRange: [number, number]
  categories: string[]
  locations: string[]
  onCategoryChange: (category: string) => void
  onLocationChange: (location: string) => void
  onPriceRangeChange: (range: [number, number]) => void
  onCreateListing?: () => void
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
  selectedLocation,
  categories,
  locations,
  onCategoryChange,
  onLocationChange,
  onCreateListing
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
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-16 overflow-y-auto transition-colors">
      <div className="p-4 space-y-4">
        {/* Create listing button */}
        <Button 
          onClick={onCreateListing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create new listing
        </Button>

        {/* Location filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {/* Search input */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search locations..."
                        value={locationSearchTerm}
                        onChange={(e) => setLocationSearchTerm(e.target.value)}
                        className="pl-10 pr-8"
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
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                          selectedLocation === location.name ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                        onClick={() => handleLocationSelect(location.name)}
                      >
                        <div>
                          <div className="font-medium">{location.name}</div>
                          {location.region && (
                            <div className="text-xs text-gray-500">{location.region} region</div>
                          )}
                        </div>
                        {selectedLocation === location.name && (
                          <Badge variant="secondary" className="ml-2">✓</Badge>
                        )}
                      </button>
                    ))}

                    {filteredLocations.length === 0 && (
                      <div className="px-3 py-4 text-center text-gray-500">
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
                className="w-full text-gray-500 hover:text-gray-700"
                onClick={() => handleLocationSelect("All Locations")}
              >
                <X className="w-4 h-4 mr-1" />
                Clear location
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Category filter */}
        <Card>
          <CardHeader className="pb-3">
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
                className={`w-full justify-start ${
                  selectedCategory === category 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
                {selectedCategory === category && (
                  <Badge variant="secondary" className="ml-auto">
                    ✓
                  </Badge>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Quick filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Recently listed
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <List className="w-4 h-4 mr-2" />
              Price: Low to high
            </Button>
          </CardContent>
        </Card>

        {/* Info section */}
        <div className="pt-4">
          <Separator />
          <div className="pt-4 text-sm text-gray-500 space-y-1">
            <p>Help</p>
            <p>Community guidelines</p>
            <p>Safety tips</p>
          </div>
        </div>
      </div>
    </div>
  )
}