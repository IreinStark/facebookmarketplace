"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, Clock, Flag, Shield } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { Product } from '../../../lib/firebase-utils'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = params.id as string
        const productDoc = await getDoc(doc(db, 'products', productId))
        
        if (productDoc.exists()) {
          setProduct({
            id: productDoc.id,
            ...productDoc.data()
          } as Product)
        } else {
          setError('Product not found')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  const handleUserClick = () => {
    if (product?.userId) {
      router.push(`/user/${product.userId}`)
    }
  }

  const handleMessageSeller = () => {
    if (product?.id) {
      router.push(`/messages?product=${product.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Product not found'}
          </h2>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const images = product.photos?.map(p => p.url) || (product.image ? [product.image] : [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    <p>No image available</p>
                  </div>
                </div>
              )}
              
              {/* Image navigation */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail row */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex 
                        ? 'border-blue-500' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Price and Title */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ${Number(product.price).toLocaleString()}
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full ${
                    isFavorited ? 'text-red-500' : 'text-gray-500'
                  }`}
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {product.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {product.location}
                </div>
                <div className="flex items-center">
<Clock className="w-4 h-4 mr-1" />
  {(() => {
    try {
      // Handle different timestamp formats
      if (!product.createdAt) {
        return 'Recently';
      }
      
      // Handle Firebase Timestamp with toDate() method
      if (product.createdAt && typeof product.createdAt.toDate === 'function') {
        return formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true });
      }
      
      // Handle JavaScript Date object
      if (product.createdAt instanceof Date) {
        return formatDistanceToNow(product.createdAt, { addSuffix: true });
      }
      
      // Handle string date
      if (typeof product.createdAt === 'string') {
        return formatDistanceToNow(new Date(product.createdAt), { addSuffix: true });
      }
      
      // Handle number (timestamp)
      if (typeof product.createdAt === 'number') {
        return formatDistanceToNow(new Date(product.createdAt), { addSuffix: true });
      }
      
      return 'Recently';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  })()}
</div>
              </div>
            </div>

            {/* Category and Condition */}
            <div className="flex space-x-2">
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                {product.category}
              </Badge>
              <Badge variant="outline">
                {product.condition}
              </Badge>
              {product.isNegotiable && (
                <Badge variant="outline" className="text-green-600 dark:text-green-400">
                  Negotiable
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Seller Info */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                  onClick={handleUserClick}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={product.sellerProfile?.avatar} 
                      alt={product.sellerProfile?.displayName || product.seller} 
                    />
                    <AvatarFallback>
                      {product.sellerProfile?.displayName?.[0]?.toUpperCase() || 
                       product.seller?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {product.sellerProfile?.displayName || product.seller || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      View profile
                    </div>
                  </div>
                  {product.sellerProfile?.verified && (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleMessageSeller}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message Seller
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                Make an Offer
              </Button>
            </div>

            {/* Safety Tips */}
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      Safety Tips
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Meet in a public place</li>
                      <li>• Inspect the item before paying</li>
                      <li>• Don&apos;t send money in advance</li>
                      <li>• Trust your instincts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}