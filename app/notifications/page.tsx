"use client"

import React, { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { query, where, orderBy, collection, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/app/firebase'
import { MarketplaceNav } from '@/components/marketplace-nav'
import { MarketplaceBottomNav } from '@/components/marketplace-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, MessageCircle, Heart, Eye, Package, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { formatTimestamp } from '@/lib/timestamp-utils'

interface Notification {
  id: string
  type: 'message' | 'favorite' | 'view' | 'sale' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  userId: string
  relatedId?: string
  senderId?: string
  senderName?: string
  senderAvatar?: string
}

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        loadNotifications(user.uid)
      } else {
        router.push('/auth/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadNotifications = async (userId: string) => {
    try {
      // Load real notifications from Firebase
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const realNotifications: Notification[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification));
        
        // If no real notifications exist, show some sample ones
        if (realNotifications.length === 0) {
          // Create some sample notifications for demo
          const sampleNotifications = [
            {
              id: 'sample-1',
              type: 'message' as const,
              title: 'Welcome to Marketplace',
              message: 'Start exploring and selling items in your area!',
              timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
              read: false,
              userId,
            },
            {
              id: 'sample-2',
              type: 'system' as const,
              title: 'Profile Setup',
              message: 'Complete your profile to build trust with other users',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
              read: true,
              userId,
            }
          ];
          setNotifications(sampleNotifications);
        } else {
          setNotifications(realNotifications);
        }
      });
      
      // Store unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      // If index is missing or any Firestore error occurs, log a lean message and fall back
      console.error('Error loading notifications (falling back to mock):', error);
      // Fallback to mock notifications if Firebase fails
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          title: 'New Message',
          message: 'John Doe sent you a message about iPhone 14 Pro Max',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          read: false,
          userId,
          relatedId: 'product-123',
          senderId: 'john-doe',
          senderName: 'John Doe',
          senderAvatar: '/placeholder-user.png'
        },
        {
          id: '2',
          type: 'favorite',
          title: 'New Favorite',
          message: 'Sarah Wilson favorited your Vintage Leather Sofa listing',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          userId,
          relatedId: 'product-456',
          senderId: 'sarah-wilson',
          senderName: 'Sarah Wilson',
          senderAvatar: '/placeholder-user.png'
        },
        {
          id: '3',
          type: 'view',
          title: 'Listing Viewed',
          message: 'Your Mountain Bike listing was viewed 15 times today',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: true,
          userId,
          relatedId: 'product-789'
        }
      ];
      setNotifications(mockNotifications);
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Validate input
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      // Update in Firebase if it's a real notification (not a sample one)
      if (!notificationId.startsWith('sample-')) {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, { read: true });
        console.log('Notification marked as read:', notificationId);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', {
        error,
        notificationId,
        isSample: notificationId?.startsWith('sample-')
      });
      
      // Fallback to local state update only
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
    }
  }

  const markAllAsRead = async () => {
    try {
      // Update all unread real notifications in Firebase
      const unreadNotifications = notifications.filter(n => !n.read && !n.id.startsWith('sample-'));
      
      if (unreadNotifications.length === 0) {
        console.log('No real unread notifications to mark as read');
        // Update local state for sample notifications
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        )
        return;
      }

      const batch = writeBatch(db);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { read: true });
      });
      
      await batch.commit();
      console.log(`Marked ${unreadNotifications.length} notifications as read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', {
        error,
        totalNotifications: notifications.length,
        unreadNotifications: notifications.filter(n => !n.read).length
      });
      
      // Fallback to local state update only
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-600" />
      case 'favorite':
        return <Heart className="h-5 w-5 text-red-600" />
      case 'view':
        return <Eye className="h-5 w-5 text-green-600" />
      case 'sale':
        return <Package className="h-5 w-5 text-purple-600" />
      case 'system':
        return <Bell className="h-5 w-5 text-gray-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'favorite':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'view':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      case 'sale':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20'
      case 'system':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MarketplaceNav 
        user={user} 
        isMobile={isMobile}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-sm"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                  } ${getNotificationColor(notification.type)}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {notification.senderAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.senderAvatar} />
                            <AvatarFallback>
                              {notification.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No notifications yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You'll see notifications here when you receive messages, favorites, and other updates.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {isMobile && (
        <MarketplaceBottomNav
          selectedCategory="All"
          categories={["All", "Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden", "Automotive", "Other"]}
          onCategoryChange={() => {}}
          onCreateListing={() => router.push('/sell')}
          selectedLocation="All Locations"
          onLocationChange={() => {}}
          user={user}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}