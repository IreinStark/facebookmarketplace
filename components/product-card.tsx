"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import {
  Heart,
  MessageCircle,
  MapPin,
  Eye,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Share2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ProductCardProps {
  product: {
    id: string
    title: string
    price: number
    description: string
    category: string
    location: string
    images?: string[]
    seller?: string
    userId: string
    sellerId?: string
    sellerName?: string
    sellerAvatar?: string
    sellerProfile?: {
      displayName?: string
      photoURL?: string
    }
    createdAt: {
      toDate: () => Date
      toMillis: () => number
    }
    views?: number
    condition?: string
    tags?: string[]
    isNegotiable?: boolean
  }
  currentUserId?: string
  onProductClick: (productId: string) => void
  onFavoriteClick: (productId: string) => void
  onMessageClick: (productId: string) => void
  onDeleteClick?: (productId: string) => void
  onUserClick: (userId: string) => void
  isFavorited: boolean
  showDeleteButton?: boolean
}

export function ProductCard({
  product,
  currentUserId,
  onProductClick,
  onFavoriteClick,
  onMessageClick,
  onDeleteClick,
  onUserClick,
  isFavorited,
  showDeleteButton = false
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onProductClick(product.id)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onFavoriteClick(product.id)
  }

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onMessageClick(product.id)
  }

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onUserClick(product.userId || product.sellerId || '')
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onDeleteClick) {
      onDeleteClick(product.id)
    }
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this ${product.category.toLowerCase()}: ${product.title}`,
        url: `${window.location.origin}/products/${product.id}`
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`)
    }
  }

  const getSellerName = () => {
    return product.sellerProfile?.displayName || product.sellerName || product.seller || 'Anonymous'
  }

  const getSellerAvatar = () => {
    return product.sellerProfile?.photoURL || product.sellerAvatar
  }

  const getMainImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0]
    }
    return '/placeholder.svg?height=200&width=200'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Image Container */}
      <div 
        className="relative aspect-square cursor-pointer overflow-hidden"
        onClick={handleProductClick}
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}

        {/* Product Image */}
        {!imageError ? (
          <img
            src={getMainImage()}
            alt={product.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-xs">No image</p>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 w-8 h-8 p-0 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-all ${
            isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'
          }`}
          onClick={handleFavoriteClick}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>

        {/* Category Badge */}
        <Badge 
          className="absolute top-2 left-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs"
        >
          {product.category}
        </Badge>

        {/* Condition Badge */}
        {product.condition && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 text-xs"
          >
            {product.condition}
          </Badge>
        )}

        {/* Negotiable Badge */}
        {product.isNegotiable && (
          <Badge 
            className="absolute bottom-2 right-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs"
          >
            Negotiable
          </Badge>
        )}

        {/* Options Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-12 w-8 h-8 p-0 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DropdownMenuItem onClick={handleShareClick}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            {showDeleteButton && (
              <>
                <DropdownMenuItem onClick={() => window.open(`/products/${product.id}/edit`, '_blank')}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 dark:text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {!showDeleteButton && (
              <DropdownMenuItem>
                <Flag className="w-4 h-4 mr-2" />
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <CardContent className="p-3">
        {/* Title and Price */}
        <div 
          className="cursor-pointer mb-2" 
          onClick={handleProductClick}
        >
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              ${product.price.toLocaleString()}
            </p>
            {product.views && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Eye className="w-3 h-3 mr-1" />
                {product.views}
              </div>
            )}
          </div>
        </div>

        {/* Location and Time */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate mr-2">{product.location}</span>
          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">
            {formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true })}
          </span>
        </div>

        {/* Seller Info */}
        <div 
          className="flex items-center space-x-2 mb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1 -m-1 transition-colors"
          onClick={handleUserClick}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={getSellerAvatar()} alt={getSellerName()} />
            <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {getSellerName()[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {getSellerName()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleMessageClick}
            className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={currentUserId === (product.userId || product.sellerId)}
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Message
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            className={`w-8 h-8 p-0 ${
              isFavorited 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}