"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, MapPin, Clock, MessageCircle, Shield, Calendar } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Textarea } from '../../../components/ui/textarea'
import { ProductCard } from '../../../components/product-card'
import { formatDistanceToNow } from 'date-fns'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../../firebase'
import { Product } from '../../../lib/firebase-utils'

interface UserProfile {
  id: string
  displayName: string
  email: string
  bio?: string
  avatar?: string
  verified: boolean
  joinedAt: Date
  location?: string
  responseTime?: string
  rating: number
  reviewCount: number
}

interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  comment: string
  createdAt: Date
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userListings, setUserListings] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = params.id as string
        
        // Mock user profile data (in real app, fetch from users collection)
        const mockUserProfile: UserProfile = {
          id: userId,
          displayName: `User ${userId.slice(0, 8)}`,
          email: `user${userId.slice(0, 8)}@example.com`,
          bio: "Passionate about finding great deals and sharing quality items with the community.",
          verified: Math.random() > 0.5,
          joinedAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
          location: "Cyprus",
          responseTime: "Usually responds within 2 hours",
          rating: 4.2 + Math.random() * 0.8,
          reviewCount: Math.floor(Math.random() * 50) + 5
        }
        setUserProfile(mockUserProfile)

        // Fetch user's listings
        const listingsQuery = query(
          collection(db, 'products'),
          where('userId', '==', userId)
        )
        const listingsSnapshot = await getDocs(listingsQuery)
        const listings = listingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[]
        setUserListings(listings)

        // Mock reviews data
        const mockReviews: Review[] = Array.from({ length: mockUserProfile.reviewCount }, (_, i) => ({
          id: `review-${i}`,
          reviewerId: `reviewer-${i}`,
          reviewerName: `Reviewer ${i + 1}`,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
          comment: [
            "Great seller! Item was exactly as described.",
            "Fast response and smooth transaction.",
            "Highly recommend! Very professional.",
            "Item in excellent condition, would buy again.",
            "Quick delivery and fair pricing."
          ][Math.floor(Math.random() * 5)],
          createdAt: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28))
        }))
        setReviews(mockReviews.slice(0, 5)) // Show latest 5 reviews

      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  const handleMessageUser = () => {
    if (userProfile?.id) {
      router.push(`/messages?user=${userProfile.id}`)
    }
  }

  const handleSubmitReview = async () => {
    if (!currentUser || !userProfile || newRating === 0) return

    setSubmittingReview(true)
    try {
      // In a real app, save to reviews collection
      const newReview: Review = {
        id: `review-${Date.now()}`,
        reviewerId: currentUser.uid,
        reviewerName: currentUser.displayName || 'Anonymous',
        reviewerAvatar: currentUser.photoURL,
        rating: newRating,
        comment: newComment,
        createdAt: new Date()
      }

      setReviews(prev => [newReview, ...prev])
      setNewRating(0)
      setNewComment('')
      setShowReviewForm(false)
    } catch (err) {
      console.error('Error submitting review:', err)
    } finally {
      setSubmittingReview(false)
    }
  }

  const StarRating = ({ rating, size = 16, onRatingChange }: { 
    rating: number
    size?: number
    onRatingChange?: (rating: number) => void 
  }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`${onRatingChange ? 'cursor-pointer' : ''}`}
            onClick={() => onRatingChange?.(star)}
          >
            <Star
              className={`${onRatingChange ? 'hover:text-yellow-400' : ''}`}
              style={{ width: size, height: size }}
              fill={star <= rating ? '#fbbf24' : 'none'}
              color={star <= rating ? '#fbbf24' : '#d1d5db'}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'User not found'}
          </h2>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.uid === userProfile.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.displayName} />
                    <AvatarFallback className="text-2xl">
                      {userProfile.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {userProfile.displayName}
                    </h1>
                    {userProfile.verified && (
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <StarRating rating={userProfile.rating} size={20} />
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {userProfile.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({userProfile.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Bio */}
                  {userProfile.bio && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {userProfile.bio}
                    </p>
                  )}

                  {/* User Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {userListings.length}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {userProfile.reviewCount}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Reviews</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {formatDistanceToNow(userProfile.joinedAt, { addSuffix: true })}
                    </div>
                    {userProfile.location && (
                      <div className="flex items-center justify-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {userProfile.location}
                      </div>
                    )}
                    {userProfile.responseTime && (
                      <div className="flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {userProfile.responseTime}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile && (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleMessageUser}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message {userProfile.displayName}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Write a Review
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review Form */}
            {showReviewForm && !isOwnProfile && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    <StarRating 
                      rating={newRating} 
                      size={24} 
                      onRatingChange={setNewRating} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment
                    </label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={newRating === 0 || submittingReview}
                      className="flex-1"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Listings */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {isOwnProfile ? 'Your Listings' : `${userProfile.displayName}'s Listings`}
              </h2>
              
              {userListings.length === 0 ? (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? "You haven't listed any items yet." : "No listings found."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userListings.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currentUserId={currentUser?.uid}
                      onProductClick={(id) => router.push(`/products/${id}`)}
                      onUserClick={(id) => router.push(`/user/${id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Reviews ({userProfile.reviewCount})
              </h2>
              
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                          <AvatarFallback>
                            {review.reviewerName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {review.reviewerName}
                            </span>
                            <StarRating rating={review.rating} size={14} />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {review.comment}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}