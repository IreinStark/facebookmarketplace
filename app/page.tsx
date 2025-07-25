"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/firebase"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@components/ui/sheet"
import { ScrollArea } from "@components/ui/scroll-area"
import { Textarea } from "@components/ui/textarea"
import { Slider } from "@components/ui/slider"
import { Label } from "@components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { Search, MapPin, MessageCircle, Heart, User, Plus, Moon, Sun, MessageSquare, Menu, Send, LogOut, AlertCircle, Tag, X } from "lucide-react"
import { Alert, AlertDescription } from "@components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ChatInterface } from "../components/chat-interface"
import { PhotoUpload } from "../components/photo-upload"
import { useSocket } from "../hooks/use-socket"
import { subscribeToProducts, getAllProducts, type Product } from "../lib/firebase-utils"
import { formatDistanceToNow } from "date-fns"
import { Timestamp } from "firebase/firestore"
import { getUserProfile, getUserDisplayName, calculateDistance, type UserProfile } from "../lib/user-utils"
import { NearMeFilter } from "../components/near-me-filter"

// Location data with coordinates (lat, lng)
const locationData = [
	{ name: "Lefkosa", lat: 35.1856, lng: 33.3823, region: "Central" },
	{ name: "Girne", lat: 35.3414, lng: 33.3152, region: "Northern" },
	{ name: "Famagusta", lat: 35.1264, lng: 33.9378, region: "Eastern" },
	{ name: "Iskele", lat: 35.2833, lng: 33.9167, region: "Eastern" },
	{ name: "Guzelyurt", lat: 35.2042, lng: 33.0292, region: "Western" },
	{ name: "Lapta", lat: 35.3333, lng: 33.1833, region: "Northern" },
	{ name: "Alsancak", lat: 35.3167, lng: 33.2167, region: "Northern" },
	{ name: "Catalkoy", lat: 35.35, lng: 33.3833, region: "Northern" },
	{ name: "Esentepe", lat: 35.3667, lng: 33.5167, region: "Northern" },
	{ name: "Bogaz", lat: 35.3833, lng: 33.6167, region: "Northern" },
	{ name: "Dipkarpaz", lat: 35.6, lng: 34.3833, region: "Karpaz" },
	{ name: "Yeni Iskele", lat: 35.2667, lng: 33.9333, region: "Eastern" },
]

// Mock data for testing (you can switch to real Firebase data later)
const mockProducts = [
	{
		id: "1",
		title: "iPhone 14 Pro Max",
		description: "Latest iPhone in excellent condition with all accessories",
		price: 899,
		location: "Downtown",
		image: "/placeholder.svg?height=200&width=200",
		category: "Electronics",
		condition: "Like New",
		isNegotiable: true,
		userId: "mock-seller-1",
		createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
		photos: []
	},
	{
		id: "2", 
		title: "Vintage Leather Sofa",
		description: "Beautiful vintage leather sofa, perfect for any living room",
		price: 450,
		location: "Suburbs",
		image: "/placeholder.svg?height=200&width=200",
		category: "Furniture",
		condition: "Good",
		isNegotiable: true,
		userId: "mock-seller-2",
		createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 1 week ago
		photos: []
	},
	{
		id: "3",
		title: "Mountain Bike",
		description: "High-quality mountain bike, great for trails and city riding",
		price: 320,
		location: "City Center", 
		image: "/placeholder.svg?height=200&width=200",
		category: "Sports",
		condition: "Good",
		isNegotiable: false,
		userId: "mock-seller-3",
		createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
		photos: []
	},
	{
		id: "4",
		title: "Gaming Laptop",
		description: "Powerful gaming laptop with RTX graphics card",
		price: 1200,
		location: "Tech District",
		image: "/placeholder.svg?height=200&width=200", 
		category: "Electronics",
		condition: "Like New",
		isNegotiable: true,
		userId: "mock-seller-4",
		createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
		photos: []
	},
	{
		id: "5",
		title: "Dining Table Set",
		description: "Solid wood dining table with 6 chairs",
		price: 280,
		location: "Residential Area",
		image: "/placeholder.svg?height=200&width=200",
		category: "Furniture", 
		condition: "Good",
		isNegotiable: true,
		userId: "mock-seller-5",
		createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
		photos: []
	},
	{
		id: "6",
		title: "Tennis Racket",
		description: "Professional tennis racket in great condition",
		price: 85,
		location: "Sports Complex",
		image: "/placeholder.svg?height=200&width=200",
		category: "Sports",
		condition: "Good", 
		isNegotiable: false,
		userId: "mock-seller-6",
		createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)), // 4 days ago
		photos: []
	}
] as Product[];

// Mock seller names for testing
const mockSellerNames: { [key: string]: string } = {
	'mock-seller-1': 'John Doe',
	'mock-seller-2': 'Sarah Wilson', 
	'mock-seller-3': 'Mike Johnson',
	'mock-seller-4': 'Alex Chen',
	'mock-seller-5': 'Emma Davis',
	'mock-seller-6': 'David Brown'
};

// Categories for filtering (matching the sell page categories)
const categories = ["All", "Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden", "Automotive", "Other"]

// Extract unique locations from products for filtering
const locations = ["All Locations", "Downtown", "Suburbs", "City Center", "Tech District", "Residential Area", "Sports Complex"]

export default function MarketplacePage() {
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [selectedLocation, setSelectedLocation] = useState("All Locations")
	const [searchTerm, setSearchTerm] = useState("")
	const [sortBy, setSortBy] = useState("newest")
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
	const [showPriceFilter, setShowPriceFilter] = useState(false)
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
	const [user, setUser] = useState<any>(null)
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
	const [isMessagesOpen, setIsMessagesOpen] = useState(false)
	const [selectedRecipient, setSelectedRecipient] = useState<{id: string, name: string} | null>(null)
	const [selectedProduct, setSelectedProduct] = useState<{id: string, title: string} | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [favorites, setFavorites] = useState<string[]>([])
	const { theme, setTheme } = useTheme()

	// Products state
	const [products, setProducts] = useState<Product[]>([])
	const [productsLoading, setProductsLoading] = useState(true)

	// Initialize Socket.io for real-time chat
	const socket = useSocket({
		userId: user?.uid,
		userName: userProfile?.displayName,
		enabled: isLoggedIn === true
	})

	// Enhanced auth state management
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (firebaseUser) {
					setUser(firebaseUser)
					setIsLoggedIn(true)
					
					// Load user profile from Firestore
					const profile = await getUserProfile(firebaseUser)
					setUserProfile(profile)
					
					setFavorites([])
					setError(null)
				} else {
					setUser(null)
					setUserProfile(null)
					setIsLoggedIn(false)
					setFavorites([])
				}
			} catch (err: any) {
				setError("Failed to load user data: " + (err?.message || "Unknown error"))
			} finally {
				setLoading(false