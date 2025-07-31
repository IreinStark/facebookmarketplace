"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { ArrowLeft, MapPin, Clock, Star, MessageCircle, Shield, Calendar, Package } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { auth, db } from "../../firebase"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Textarea } from "../../../components/ui/textarea"
import { ProductCard } from "../../../components/product-card"
import { getUserProducts, type Product } from "../../../lib/firebase-utils"

interface UserProfile {
  id: string
  uid: string
  displayName: string
  email: string
  bio?: string
  avatar?: string
  verified: boolean
  joinedAt: Date
  location?: string
  responseTime?: string
  rating?: number
  reviewCount?: number
}

interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  comment: string
  createdAt: any // Firestore timestamp or Date
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  // Fetch user profile, products, and reviews
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return

      try {
        setLoading(true)
        setError(null)
        
        // Fetch user profile
        const profileRef = doc(db, 'userProfiles', userId)
        const profileSnap = await getDoc(profileRef)
        
        if (!profileSnap.exists()) {
          setError('User not found')
          return
        }
        
        const profileSnapData = profileSnap.data()
        const profileData: UserProfile = {
          id: userId,
          uid: userId,
          displayName: profileSnapData?.displayName || 'Unknown User',
          email: profileSnapData?.email || '',
          bio: profileSnapData?.bio,
          avatar: profileSnapData?.avatar,
          verified: profileSnapData?.verified || false,
          joinedAt: profileSnapData?.joinedAt?.toDate() || new Date(),
          location: profileSnapData?.location,
          responseTime: profileSnapData?.responseTime,
          rating: profileSnapData?.rating || 0,
          reviewCount: profileSnapData?.reviewCount || 0
        }
        
        setProfile(profileData)
        
        // Fetch user's products
        const userProducts = await getUserProducts(userId)
        setProducts(userProducts)
        
        // Fetch reviews
        const reviewsQuery = query(
          collection(db, 'userReviews'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )
        
        const reviewsSnap = await getDocs(reviewsQuery)
        const reviewsData = reviewsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Review))
        
        setReviews(reviewsData)
        
      } catch (error: any) {
        console.error('Error fetching user data:', error)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const handleGoBack = () => {
    router.back()
  }

  const handleMessageUser = () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    
    router.push(`/messages?user=${userId}`)
  }

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  const calculateAverageRating = (): number => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return Number((total / reviews.length).toFixed(1))
  }

  const handleSubmitReview = async () => {
    if (!currentUser || !rating || !comment.trim()) {
      return
    }

    if (currentUser.uid === userId) {
      alert("You can't review yourself!")
      return
    }

    try {
      setSubmittingReview(true)
      
      await addDoc(collection(db, 'userReviews'), {
        userId: userId,
        reviewerId: currentUser.uid,
        reviewerName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        reviewerAvatar: currentUser.photoURL || '',
        rating: rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      })

      // Refresh reviews
      const reviewsQuery = query(
        collection(db, 'userReviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const reviewsSnap = await getDocs(reviewsQuery)
      const reviewsData = reviewsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as Review))
      
      setReviews(reviewsData)
      
      // Reset form
      setRating(0)
      setComment("")
      setShowReviewForm(false)
      
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const StarRating = ({ 
    rating: currentRating, 
    onRatingChange, 
    readOnly = false, 
    size = "w-5 h-5" 
  }: {
    rating: number
    onRatingChange?: (rating: number) => void
    readOnly?: boolean
    size?: string
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= currentRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${!readOnly ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => !readOnly && onRatingChange?.(star)}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-xl font-semibold mb-2">User not found</h2>
            <p className="text-gray-600 mb-4">
              {error || "The user profile you're looking for doesn't exist."}
            </p>
            <Button onClick={handleGoBack} variant="outline">
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const averageRating = calculateAverageRating()
  const isOwnProfile = currentUser?.uid === userId

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
              <h1 className="text-lg font-semibold">{profile.displayName}</h1>
              <p className="text-sm text-gray-500">User profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Profile info and reviews */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar} alt={profile.displayName} />
                    <AvatarFallback className="text-2xl">
                      {profile.displayName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <h2 className="text-xl font-semibold">{profile.displayName}</h2>
                    {profile.verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <StarRating rating={averageRating} readOnly />
                    <span className="text-sm text-gray-600 ml-2">
                      {averageRating > 0 ? `${averageRating.toFixed(1)} (${reviews.length} reviews)` : 'No reviews yet'}
                    </span>
                  </div>

                  {profile.bio && (
                    <p className="text-gray-600 text-sm mb-4">{profile.bio}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-500">
                    {profile.location && (
                      <div className="flex items-center justify-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {profile.joinedAt ? formatDistanceToNow(profile.joinedAt, { addSuffix: true }) : 'Recently'}
                    </div>
                    <div className="flex items-center justify-center">
                      <Package className="w-4 h-4 mr-1" />
                      {products.length} listings
                    </div>
                  </div>
                </div>

                {!isOwnProfile && currentUser && (
                  <div className="space-y-2">
                    <Button 
                      onClick={handleMessageUser}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      variant="outline"
                      className="w-full"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write a review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review form */}
            {showReviewForm && !isOwnProfile && currentUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Write a review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <StarRating 
                      rating={rating} 
                      onRatingChange={setRating}
                      size="w-8 h-8"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this seller..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={!rating || !comment.trim() || submittingReview}
                      className="flex-1"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit review'}
                    </Button>
                    <Button
                      onClick={() => setShowReviewForm(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                            <AvatarFallback>
                              {review.reviewerName?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{review.reviewerName}</span>
                              <StarRating rating={review.rating} readOnly size="w-4 h-4" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {review.createdAt ? 
                                formatDistanceToNow(
                                  review.createdAt.toDate ? review.createdAt.toDate() : review.createdAt, 
                                  { addSuffix: true }
                                ) : 
                                'Recently'
                              }
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - User's listings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isOwnProfile ? 'Your listings' : `${profile.displayName}'s listings`} ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                    <p className="text-gray-600">
                      {isOwnProfile ? 'Start selling by creating your first listing!' : 'This user hasn\'t listed anything yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => {
                      // Transform Product to match ProductCard expected format
                      const transformedProduct = {
                        ...product,
                        sellerProfile: product.sellerProfile ? {
                          displayName: product.sellerProfile.displayName,
                          photoURL: product.sellerProfile.avatar
                        } : undefined
                      }
                      
                      return (
                        <ProductCard
                          key={product.id}
                          product={transformedProduct}
                          onProductClick={handleProductClick}
                          currentUserId={currentUser?.uid}
                        />
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}