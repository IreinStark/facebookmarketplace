"use client"

import React from 'react'
import { Filter, Grid3X3, List, Plus, Clock, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'

interface MarketplaceSidebarProps {
  selectedCategory: string
  categories: string[]
  onCategoryChange: (category: string) => void
  onCreateListing?: () => void
}

export function MarketplaceSidebar({
  selectedCategory,
  categories,
  onCategoryChange,
  onCreateListing
}: MarketplaceSidebarProps) {
  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-16 overflow-y-auto transition-colors">
      <div className="p-4 space-y-4">
        {/* Create listing button */}
        <Button 
          onClick={onCreateListing}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create new listing
        </Button>

        {/* Category filter */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center dark:text-gray-100">
              <Filter className="w-5 h-5 mr-2" />
              Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>

        {/* Quick filters */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg dark:text-gray-100">Quick filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        {/* Info section */}
        <div className="pt-4">
          <Separator className="dark:bg-gray-700" />
          <div className="pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Help</p>
            <p className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Community guidelines</p>
            <p className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Safety tips</p>
            <p className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Report an issue</p>
          </div>
        </div>
      </div>
    </div>
  )
}