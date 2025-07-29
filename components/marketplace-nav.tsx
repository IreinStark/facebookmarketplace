"use client"

import React from 'react'
import { Search, MessageCircle, Bell, User, ShoppingBag, Menu } from 'lucide-react'
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

interface MarketplaceNavProps {
  user?: {
    displayName?: string
    photoURL?: string
    email?: string
  } | null
  onSearch?: (query: string) => void
  searchValue?: string
}

export function MarketplaceNav({ user, onSearch, searchValue }: MarketplaceNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left section - Logo and Marketplace */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-blue-600">Marketplace</h1>
              <p className="text-xs text-gray-500">Local community buying & selling</p>
            </div>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search Marketplace"
              value={searchValue || ''}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-100 border-none rounded-full focus:bg-white focus:shadow-md transition-all"
            />
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