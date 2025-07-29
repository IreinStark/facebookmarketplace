"use client"

import React from 'react'
import { MapPin, Filter, Grid3X3, List, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'

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

export function MarketplaceSidebar({
  selectedCategory,
  selectedLocation,
  categories,
  locations,
  onCategoryChange,
  onLocationChange,
  onCreateListing
}: MarketplaceSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen sticky top-16 overflow-y-auto">
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
          <CardContent>
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Within 25 km
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