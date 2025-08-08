"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Share2,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Type definitions to match your marketplace page
interface UserProfile {
  displayName?: string
  photoURL?: string
  email?: string
}

interface ProductCardProduct {
  id: string
  title: string
  price: number
  description: string
  category: string
  location: string
  images?: string[]
  image?: string
  photos?: Array<{
    id: string
    url: string
    filename: string
  }>
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
    toDate?: () => Date
    toMillis?: () => number
  } | Date | string | number
  views?: number
  condition?: string
  tags?: string[]
  isNegotiable?: boolean
}

// Updated interface to match what your marketplace page passes
interface ProductCardProps {
  product: ProductCardProduct
  onProductClick: () => void
  onFavoriteClick: () => void
  onMessageClick: () => void
  onDeleteClick: () => void | Promise<void>
  onUserClick: () => void
  isOwner: boolean
  isLoggedIn: boolean
  userProfile: UserProfile | null
  // Optional props for backward compatibility
  currentUserId?: string
  isFavorited?: boolean
  showDeleteButton?: boolean
}

export function ProductCard({
  product,
  onProductClick,
  onFavoriteClick,
  onMessageClick,
  onDeleteClick,
  onUserClick,
  isOwner,
  isLoggedIn,
  userProfile,
  currentUserId,
  isFavorited = false,
  showDeleteButton = false
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [heartAnimation, setHeartAnimation] = useState(false)

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onProductClick()
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Trigger heart animation
    setHeartAnimation(true)
    setTimeout(() => setHeartAnimation(false), 600)
    
    onFavoriteClick()
  }

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onMessageClick()
  }

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onUserClick()
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onDeleteClick()
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

  const getAllImages = () => {
    const images: string[] = []
    
    // Collect images from various sources
    if (product.images && product.images.length > 0) {
      images.push(...product.images)
    }
    
    if (product.image && !images.includes(product.image)) {
      images.push(product.image)
    }
    
    // Check for Cloudinary photos array
    if (product.photos && product.photos.length > 0) {
      product.photos.forEach(photo => {
        if (photo.url && !images.includes(photo.url)) {
          images.push(photo.url)
        }
      })
    }
    
    // If no images, return placeholder
    if (images.length === 0) {
      images.push('/placeholder.svg?height=300&width=300')
    }
    
    return images
  }

  const images = getAllImages()
  const currentImage = images[currentImageIndex] || images[0]

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Helper function to convert createdAt to Date object
  const getCreatedAtDate = (): Date => {
    const { createdAt } = product
    
    if (!createdAt) return new Date()
    
    // If it's already a Date object
    if (createdAt instanceof Date) {
      return createdAt
    }
    
    // If it's a Firebase Timestamp with toDate method
    if (typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
      return createdAt.toDate()
    }
    
    // If it's a string date
    if (typeof createdAt === 'string') {
      return new Date(createdAt)
    }
    
    // If it's a number (timestamp)
    if (typeof createdAt === 'number') {
      return new Date(createdAt)
    }
    
    // Fallback to current date
    return new Date()
  }

  // Use isOwner prop instead of showDeleteButton for consistency
  const shouldShowDeleteButton = isOwner || showDeleteButton

  return (
    <Card className="group relative overflow-hidden border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 rounded-2xl">
      {/* Gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-950/10 dark:via-transparent dark:to-purple-950/10 pointer-events-none" />
      
      {/* Image Container */}
      <div 
        className="relative aspect-square cursor-pointer overflow-hidden rounded-t-2xl"
        onClick={handleProductClick}
      >
        {/* Loading Skeleton with shimmer effect */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse z-10">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 dark:via-gray-400/20 to-transparent" />
          </div>
        )}

        {/* Product Image */}
        {!imageError ? (
          <Image
            src={currentImage}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ${
              isLoading ? 'opacity-0 scale-110' : 'opacity-100 scale-100 group-hover:scale-110'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-sm font-medium">No Image Available</p>
            </div>
          </div>
        )}

        {/* Image Navigation Controls */}
        {images.length > 1 && !imageError && (
          <>
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Image Indicators */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? 'bg-white shadow-lg'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setCurrentImageIndex(index)
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Action Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30">
          {/* Category Badge */}
          <Badge className="bg-white/95 dark:bg-gray-900/95 text-gray-800 dark:text-gray-200 border-0 font-medium px-3 py-1 text-xs backdrop-blur-sm shadow-lg">
            {product.category}
          </Badge>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Options Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm shadow-lg border-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl rounded-xl shadow-2xl">
                <DropdownMenuItem onClick={handleShareClick} className="rounded-lg">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                {shouldShowDeleteButton && (
                  <>
                    <DropdownMenuItem onClick={() => window.open(`/products/${product.id}/edit`, '_blank')} className="rounded-lg">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Listing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 dark:text-red-400 rounded-lg">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {!shouldShowDeleteButton && (
                  <DropdownMenuItem className="rounded-lg">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorite Button with enhanced animations */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 rounded-full backdrop-blur-sm shadow-lg border-0 transition-all duration-300 relative ${
                isFavorited 
                  ? 'bg-red-100/95 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200/95 dark:hover:bg-red-900/70' 
                  : 'bg-white/95 dark:bg-gray-900/95 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-red-500'
              }`}
              onClick={handleFavoriteClick}
              disabled={!isLoggedIn}
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${
                isFavorited ? 'fill-current scale-110' : 'hover:scale-110'
              } ${heartAnimation ? 'animate-bounce scale-125' : ''}`} />
              
              {/* Heart animation sparkles */}
              {heartAnimation && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-red-400 rounded-full animate-ping" />
                  <div className="absolute top-1 right-1 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-100" />
                  <div className="absolute bottom-1 left-1 w-1 h-1 bg-red-300 rounded-full animate-ping animation-delay-200" />
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-20">
          <div className="flex flex-col gap-2">
            {/* Condition Badge */}
            {product.condition && (
              <Badge 
                variant="secondary" 
                className="bg-white/95 dark:bg-gray-900/95 text-gray-800 dark:text-gray-200 border-0 font-medium px-2 py-1 text-xs backdrop-blur-sm shadow-lg"
              >
                {product.condition}
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {/* View Count */}
            {product.views && product.views > 0 && (
              <div className="flex items-center gap-1 bg-black/60 dark:bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                <Eye className="w-3 h-3" />
                {product.views > 1000 ? `${(product.views/1000).toFixed(1)}k` : product.views}
              </div>
            )}

            {/* Negotiable Badge */}
            {product.isNegotiable && (
              <Badge 
                className="bg-green-100/95 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-0 font-medium px-2 py-1 text-xs backdrop-blur-sm shadow-lg"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Negotiable
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-4">
        {/* Title and Price */}
        <div 
          className="cursor-pointer space-y-2" 
          onClick={handleProductClick}
        >
          <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {product.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              ${product.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Location and Time */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            <span className="truncate font-medium">{product.location}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(getCreatedAtDate(), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Seller Info */}
        <div 
          className="flex items-center gap-3 p-2 -mx-2 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          onClick={handleUserClick}
        >
          <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-800 shadow-sm">
            <AvatarImage src={getSellerAvatar()} alt={getSellerName()} />
            <AvatarFallback className="text-sm bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-200 font-semibold">
              {getSellerName()[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {getSellerName()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isOwner ? 'You' : 'Seller'}
            </p>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-1 bg-gray-50/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                #{tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons - Always show Message Seller */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleMessageClick}
            className="flex-1 h-9 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            disabled={!isLoggedIn}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Seller
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            className={`w-9 h-9 p-0 rounded-xl transition-all duration-300 hover:scale-110 relative ${
              isFavorited 
                ? 'text-red-500 hover:text-red-600 bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50/80 dark:hover:bg-red-900/20'
            }`}
            disabled={!isLoggedIn}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${
              isFavorited ? 'fill-current' : ''
            } ${heartAnimation ? 'animate-bounce scale-125' : ''}`} />
          </Button>
        </div>
      </CardContent>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 group-hover:ring-blue-300/50 dark:group-hover:ring-blue-600/30 transition-all duration-300 pointer-events-none" />
    </Card>
  )
}