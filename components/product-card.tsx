"use client"

import React, { useState } from 'react'
import { MapPin, Heart, MessageCircle, Eye, Clock, Trash2, User } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
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
    sellerProfile?: {
      displayName?: string
      photoURL?: string
    }
    createdAt: {
      toDate: () => Date
    }
    views?: number
  }
  currentUserId?: string
  onProductClick?: (productId: string) => void
  onFavoriteClick?: (productId: string) => void
  onMessageClick?: (productId: string) => void
  onDeleteClick?: (productId: string) => void
  onUserClick?: (userId: string) => void
  isFavorited?: boolean
}

export function ProductCard({ 
  product, 
  currentUserId,
  onProductClick, 
  onFavoriteClick, 
  onMessageClick,
  onDeleteClick,
  onUserClick,
  isFavorited = false 
}: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const isOwner = currentUserId === product.userId

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    onDeleteClick?.(product.id)
    setShowDeleteDialog(false)
  }

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUserClick?.(product.userId)
  }

  return (
    <>
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
        onClick={handleCardClick}
      >
        <div className="relative">
          {/* Product image */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                <div className="text-gray-400 dark:text-gray-500 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 dark:bg-gray-500 rounded-lg"></div>
                  <p className="text-sm">No image</p>
                </div>
              </div>
            )}
            
            {/* Action buttons overlay */}
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
              {/* Favorite button */}
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full p-2 ${
                  isFavorited 
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800' 
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
                onClick={handleFavoriteClick}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>

              {/* Delete button (only for owner) */}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 bg-white/80 dark:bg-gray-800/80 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

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
            className="absolute top-2 left-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-0"
          >
            {product.category}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Price */}
          <div className="mb-2">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              ${Number(product.price).toLocaleString()}
            </p>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>

          {/* Location and time */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="mr-2">{product.location}</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true })}</span>
          </div>

          {/* Seller info and actions */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1 -m-1 transition-colors"
              onClick={handleUserClick}
            >
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
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-24">
                {product.sellerProfile?.displayName || product.seller || 'Seller'}
              </span>
            </div>

            {/* Message button (only if not owner) */}
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900"
                onClick={handleMessageClick}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.title}"? This action cannot be undone and will permanently remove your listing from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}