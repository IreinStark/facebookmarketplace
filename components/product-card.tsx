"use client"

import React from 'react'
import { MapPin, Heart, MessageCircle, Eye, Clock } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
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
    sellerProfile?: {
      displayName?: string
      photoURL?: string
    }
    createdAt: {
      toDate: () => Date
    }
    views?: number
  }
  onProductClick?: (productId: string) => void
  onFavoriteClick?: (productId: string) => void
  onMessageClick?: (productId: string) => void
  isFavorited?: boolean
}

export function ProductCard({ 
  product, 
  onProductClick, 
  onFavoriteClick, 
  onMessageClick, 
  isFavorited = false 
}: ProductCardProps) {
  const handleCardClick = () => {
    onProductClick?.(product.id)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavoriteClick?.(product.id)
  }

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMessageClick?.(product.id)
  }

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-lg overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Product image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-gray-400 text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg"></div>
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 rounded-full p-2 ${
              isFavorited 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>

          {/* Views counter */}
          {product.views && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {product.views}
            </div>
          )}
        </div>

        {/* Category badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 bg-blue-100 text-blue-800 border-0"
        >
          {product.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* Price */}
        <div className="mb-2">
          <p className="text-xl font-bold text-gray-900">
            ${Number(product.price).toLocaleString()}
          </p>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {/* Location and time */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="mr-2">{product.location}</span>
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true })}</span>
        </div>

        {/* Seller info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage 
                src={product.sellerProfile?.photoURL} 
                alt={product.sellerProfile?.displayName || product.seller} 
              />
              <AvatarFallback className="text-xs">
                {product.sellerProfile?.displayName?.[0]?.toUpperCase() || 
                 product.seller?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 truncate max-w-24">
              {product.sellerProfile?.displayName || product.seller || 'Seller'}
            </span>
          </div>

          {/* Message button */}
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={handleMessageClick}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}