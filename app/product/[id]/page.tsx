"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { ArrowLeft, MapPin, Clock, Heart, MessageCircle, Share2, Flag, Eye, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { auth, db } from "../../firebase"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { PhotoGallery } from "../../../components/photo-gallery"
import { type Product } from "../../../lib/firebase-utils"
import { getUserProfile, type UserProfile } from "../../../lib/user-utils"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<UserProfile | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        const productRef = doc(db, 'products', productId)
        const productSnap = await getDoc(productRef)
        
        if (!productSnap.exists()) {
          setError('Product not found')
          return
        }
        
        const productData = {
          id: productSnap.id,
          ...productSnap.data()
        } as Product
        
        setProduct(productData)
        
        // Fetch seller profile if userId exists
        if (productData.userId) {
          try {
            const sellerRef = doc(db, 'userProfiles', productData.userId)
            const sellerSnap = await getDoc(sellerRef)
            
            if (sellerSnap.exists()) {
              setSeller({
                uid: productData.userId,
                ...sellerSnap.data()
              } as UserProfile)
            }
          } catch (sellerError) {
            console.error('Error fetching seller profile:', sellerError)
          }
        }
        
      } catch (error: any) {
        console.error('Error fetching product:', error)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleGoBack = () => {
    window.history.back()
  }

  const handleMessageSeller = () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth/login'
      return
    }
    
    // TODO: Open chat with seller
    console.log('Message seller:', product?.userId)
  }

  const handleToggleFavorite = () => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }
    
    setIsFavorited(!isFavorited)
    // TODO: Update favorites in database
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleViewProfile = () => {
    if (product?.userId) {
      window.location.href = `/user/${product.userId}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-semibold mb-2">Product not found</h2>
            <p className="text-gray-600 mb-4">
              {error || "The product you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={handleGoBack} variant="outline">
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare images for gallery
  const galleryImages = product.images?.map((url, index) => ({
    id: `img-${index}`,
    url,
    alt: product.title
  })) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold truncate max-w-96">{product.title}</h1>
              <p className="text-sm text-gray-500">Product details</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Images */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {galleryImages.length > 0 ? (
                  <PhotoGallery images={galleryImages} />
                ) : (
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg"></div>
                      <p>No images available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product description */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {product.description || "No description available."}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{product.category}</Badge>
                  {product.condition && (
                    <Badge variant="outline">{product.condition}</Badge>
                  )}
                  {product.isNegotiable && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Price negotiable
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Product info and seller */}
          <div className="space-y-6">
            {/* Price and basic info */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ${Number(product.price).toLocaleString()}
                  </div>
                  {product.isNegotiable && (
                    <p className="text-sm text-gray-600">Price negotiable</p>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {product.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true })}
                  </div>
                  {product.views && (
                    <div className="flex items-center text-gray-600">
                      <Eye className="w-4 h-4 mr-2" />
                      {product.views} views
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleMessageSeller}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Message seller
                  </Button>
                  
                  <Button
                    onClick={handleToggleFavorite}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-current text-red-600' : ''}`} />
                    {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Seller information</h3>
                
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={seller?.avatar || product.sellerProfile?.photoURL} 
                      alt={seller?.displayName || product.seller || 'Seller'} 
                    />
                    <AvatarFallback>
                      {(seller?.displayName || product.seller || 'S')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">
                        {seller?.displayName || product.seller || 'Anonymous Seller'}
                      </h4>
                      {seller?.verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className="w-4 h-4 text-gray-300" 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">
                        No ratings yet
                      </span>
                    </div>
                  </div>
                </div>

                {seller?.bio && (
                  <p className="text-sm text-gray-600 mb-4">{seller.bio}</p>
                )}

                <Button 
                  onClick={handleViewProfile}
                  variant="outline" 
                  className="w-full"
                >
                  View seller profile
                </Button>
              </CardContent>
            </Card>

            {/* Safety tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Safety tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Meet in a public place</li>
                  <li>• Check the item before paying</li>
                  <li>• Don't share personal information</li>
                  <li>• Trust your instincts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}