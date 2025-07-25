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

	// Near Me filter state
	const [nearMeEnabled, setNearMeEnabled] = useState(false)
	const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
	const [nearMeRadius, setNearMeRadius] = useState(10) // Default 10km radius

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
				setLoading(false)
			}
		})
		return () => unsubscribe()
	}, [])

	// Load products from Firebase in real-time
	useEffect(() => {
		if (!isLoggedIn) return

		setProductsLoading(true)
		const unsubscribe = subscribeToProducts((newProducts) => {
			console.log("Products received from Firebase:", newProducts.length);
			// Show real Firebase products, optionally include mock data for demo
			if (newProducts.length === 0) {
				// Only show mock products if no real products exist
				setProducts(mockProducts)
			} else {
				// Show real products first, then mock products for demo
				setProducts([...newProducts, ...mockProducts])
			}
			setProductsLoading(false)
		})

		return () => unsubscribe()
	}, [isLoggedIn])

	const handleLogout = async () => {
		try {
			await signOut(auth)
			setIsLoggedIn(false)
			setUser(null)
			setUserProfile(null)
			setFavorites([])
			setError(null)
		} catch (err: any) {
			setError("Failed to sign out: " + (err?.message || "Unknown error"))
		}
	}

	const handleToggleFavorite = (productId: string) => {
		if (!user) return
		setFavorites((prev) =>
			prev.includes(productId)
				? prev.filter((id: string) => id !== productId)
				: [...prev, productId]
		)
	}

	const handleProductMessage = (product: Product) => {
		setSelectedRecipient({
			id: product.userId,
			name: mockSellerNames[product.userId] || 'Seller'
		})
		setSelectedProduct({
			id: product.id,
			title: product.title
		})
		setIsMessagesOpen(true)
	}

	const filteredProducts = products.filter((product: Product) => {
		const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
		const matchesLocation = selectedLocation === "All Locations" || product.location === selectedLocation
		const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
		const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
							 product.description.toLowerCase().includes(searchTerm.toLowerCase())
		
		// Near Me filtering
		let matchesNearMe = true
		if (nearMeEnabled && userLocation) {
			// For demo purposes, assign random coordinates to mock products based on location data
			const locationCoords = locationData.find(loc => loc.name === product.location)
			if (locationCoords) {
				const distance = calculateDistance(
					userLocation.latitude,
					userLocation.longitude,
					locationCoords.lat,
					locationCoords.lng
				)
				matchesNearMe = distance <= nearMeRadius
			}
		}
		
		return matchesCategory && matchesLocation && matchesPrice && matchesSearch && matchesNearMe
	}).sort((a, b) => {
    const aTime = a.createdAt ? a.createdAt.toDate().getTime() : 0;
    const bTime = b.createdAt ? b.createdAt.toDate().getTime() : 0;

    switch (sortBy) {
      case "newest":
        return bTime - aTime;
      case "oldest":
        return aTime - bTime;
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
	})

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<span className="text-lg">Loading your marketplace...</span>
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Alert className="max-w-md">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{error}
						<Button onClick={() => window.location.reload()} className="mt-2 w-full">
							Retry
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	// Not logged in state
	if (!isLoggedIn) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="text-xl sm:text-2xl font-bold text-blue-600">Local Marketplace</CardTitle>
						<p className="text-muted-foreground text-sm sm:text-base">Connect with your community</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<Link href="/auth/login">
							<Button className="w-full" size="lg">
								Log In
							</Button>
						</Link>
						<Link href="/auth/signup">
							<Button variant="outline" className="w-full" size="lg">
								Sign Up
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/90">
				<div className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
					{/* Left side - Logo and Search */}
					<div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
						<h1
							className="text-base sm:text-lg lg:text-xl font-bold text-primary-foreground hidden sm:block whitespace-nowrap cursor-pointer hover:text-primary-foreground/80 transition-colors"
							onClick={() => window.location.reload()}
						>
							Local Marketplace
						</h1>
						<h1
							className="text-lg font-bold text-primary-foreground sm:hidden cursor-pointer hover:text-primary-foreground/80 transition-colors"
							onClick={() => window.location.reload()}
						>
							LM
						</h1>
						<div className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 text-sm h-9 sm:h-10"
							/>
						</div>
					</div>

					{/* User info, theme toggle, and logout */}
					<div className="flex items-center space-x-2">
                        {userProfile && (
                            <span className="text-sm text-primary-foreground mr-2 hidden sm:block">
                                {getUserDisplayName(user, userProfile)}
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            className="h-8 w-8 lg:h-9 lg:w-9"
                            title="Toggle Theme"
                        >
                            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </Button>
                        <Link href="/sell">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent text-xs flex items-center"
                                title="Sell an item"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Sell
                            </Button>
                        </Link>
                        <Link href="/profile">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 lg:h-9 lg:w-9"
                                title="Profile"
                            >
                                <User className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMessagesOpen(true)}
                            className="h-8 w-8 lg:h-9 lg:w-9"
                            title="Messages"
                        >
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="h-8 w-8 lg:h-9 lg:w-9"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

			{/* Welcome Banner */}
			<div className="container px-2 sm:px-4 py-3 sm:py-4">
				<div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 text-center border border-primary/20 dark:border-primary/30">
					<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
						Welcome to Marketplace
					</h1>
					<p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
						Buy and sell items in your local community with real-time chat
					</p>
				</div>
			</div>

			<div id="products" className="container px-2 sm:px-4 py-4 sm:py-6">
				{/* Welcome Message */}
				<div className="mb-4 sm:mb-6">
					<h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
						Welcome back, {getUserDisplayName(user, userProfile ?? undefined)}!
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} available
					</p>
				</div>

				{/* Filters Bar */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
					<div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
						{/* Categories Section */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-2 xl:mb-0">
								<Tag className="h-4 w-4 text-gray-500" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									Categories:
								</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{categories.map((category) => {
									const count = category === "All" ? products.length : products.filter(p => p.category === category).length;
									return (
										<Button
											key={category}
											variant={selectedCategory === category ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedCategory(category)}
											className={`text-xs sm:text-sm px-2 sm:px-3 py-1 h-8 transition-all ${
												selectedCategory === category 
													? 'bg-blue-600 hover:bg-blue-700 text-white' 
													: 'hover:bg-gray-100 dark:hover:bg-gray-700'
											}`}
										>
											{category}
											{count > 0 && (
												<span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
													selectedCategory === category
														? 'bg-blue-700 text-white'
														: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
												}`}>
													{count}
												</span>
											)}
										</Button>
									);
								})}
							</div>
						</div>

						{/* Filters Section */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
							{/* Location Filter */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-gray-500" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
										Location:
									</span>
								</div>
								<Select value={selectedLocation} onValueChange={setSelectedLocation}>
									<SelectTrigger className="w-full sm:w-44">
										<SelectValue placeholder="Select location" />
									</SelectTrigger>
									<SelectContent>
										{locations.map((location) => {
											const count = location === "All Locations" ? products.length : products.filter(p => p.location === location).length;
											return (
												<SelectItem key={location} value={location}>
													<div className="flex items-center justify-between gap-2 w-full">
														<div className="flex items-center gap-2">
															{location === "All Locations" ? (
																<span>🌍 {location}</span>
															) : (
																<span>📍 {location}</span>
															)}
														</div>
														{count > 0 && (
															<span className="text-xs text-gray-500">({count})</span>
														)}
													</div>
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>

							{/* Sort Filter */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
								<div className="flex items-center gap-2">
									<Search className="h-4 w-4 text-gray-500" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
										Sort by:
									</span>
								</div>
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger className="w-full sm:w-36">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="newest">🆕 Newest First</SelectItem>
										<SelectItem value="oldest">📅 Oldest First</SelectItem>
										<SelectItem value="price-low">💰 Price: Low to High</SelectItem>
										<SelectItem value="price-high">💸 Price: High to Low</SelectItem>
										<SelectItem value="title">🔤 Name: A to Z</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Price Filter */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowPriceFilter(!showPriceFilter)}
									className={`text-xs sm:text-sm ${showPriceFilter ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : ''}`}
								>
									💲 Price Filter
									{(priceRange[0] > 0 || priceRange[1] < 2000) && (
										<span className="ml-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
											${priceRange[0]}-${priceRange[1]}
										</span>
									)}
								</Button>
							</div>
						</div>
					</div>

					{/* Near Me Filter */}
					<div className="mt-4">
						<NearMeFilter
							isEnabled={nearMeEnabled}
							onToggle={setNearMeEnabled}
							onLocationChange={setUserLocation}
							onRadiusChange={setNearMeRadius}
							radius={nearMeRadius}
						/>
					</div>

					{/* Price Range Slider */}
					{showPriceFilter && (
						<div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
							<div className="flex items-center justify-between mb-3">
								<Label className="text-sm font-medium">Price Range</Label>
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
									<span>${priceRange[0]}</span>
									<span>-</span>
									<span>${priceRange[1]}</span>
								</div>
							</div>
							<Slider
								value={priceRange}
								onValueChange={(value) => setPriceRange(value as [number, number])}
								max={2000}
								min={0}
								step={25}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-gray-500 mt-2">
								<span>$0</span>
								<span>$2000+</span>
							</div>
							<div className="flex gap-2 mt-3">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPriceRange([0, 2000])}
									className="text-xs"
								>
									Reset
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowPriceFilter(false)}
									className="text-xs"
								>
									Close
								</Button>
							</div>
						</div>
					)}

					{/* Active Filters Display */}
					{(selectedCategory !== "All" || selectedLocation !== "All Locations" || sortBy !== "newest" || priceRange[0] > 0 || priceRange[1] < 2000 || nearMeEnabled) && (
						<div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
							<span className="text-xs text-gray-500">Active filters:</span>
							{selectedCategory !== "All" && (
								<div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
									<span>📂 {selectedCategory}</span>
									<button
										onClick={() => setSelectedCategory("All")}
										className="ml-1 hover:text-blue-600"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}
							{selectedLocation !== "All Locations" && (
								<div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
									<span>📍 {selectedLocation}</span>
									<button
										onClick={() => setSelectedLocation("All Locations")}
										className="ml-1 hover:text-green-600"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}
							{(priceRange[0] > 0 || priceRange[1] < 2000) && (
								<div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs">
									<span>💲 ${priceRange[0]} - ${priceRange[1]}</span>
									<button
										onClick={() => setPriceRange([0, 2000])}
										className="ml-1 hover:text-orange-600"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}
							{sortBy !== "newest" && (
								<div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
									<span>🔀 {sortBy === "oldest" ? "Oldest First" : sortBy === "price-low" ? "Price ↑" : sortBy === "price-high" ? "Price ↓" : "A-Z"}</span>
									<button
										onClick={() => setSortBy("newest")}
										className="ml-1 hover:text-purple-600"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}
							{nearMeEnabled && (
								<div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
									<span>📍 Near Me ({nearMeRadius}km)</span>
									<button
										onClick={() => {
											setNearMeEnabled(false);
											setUserLocation(null);
										}}
										className="ml-1 hover:text-blue-600"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setSelectedCategory("All");
									setSelectedLocation("All Locations");
									setSortBy("newest");
									setPriceRange([0, 2000]);
									setShowPriceFilter(false);
									setNearMeEnabled(false);
									setUserLocation(null);
								}}
								className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700"
							>
								Clear all
							</Button>
						</div>
					)}
				</div>

				{/* Products Grid */}
				{productsLoading ? (
					<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
						{[...Array(6)].map((_, i) => (
							<Card key={i} className="overflow-hidden">
								<div className="w-full h-32 sm:h-40 lg:h-48 bg-gray-200 animate-pulse"></div>
								<CardContent className="p-2 sm:p-3 lg:p-4">
									<div className="space-y-2">
										<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
										<div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
										<div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
						{filteredProducts.map((product: Product) => (
							<Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
								<div className="relative">
									<img
										src={product.image || "/placeholder.svg"}
										alt={`Image of ${product.title}`}
										className="w-full h-32 sm:h-40 lg:h-48 object-cover"
									/>
									{product.isNegotiable && (
										<Badge variant="secondary" className="absolute top-2 right-2 text-xs">
											Negotiable
										</Badge>
									)}
								</div>

								<CardContent className="p-2 sm:p-3 lg:p-4">
									<div className="space-y-2">
										<h3 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2">{product.title}</h3>
										<p className="text-base sm:text-lg lg:text-2xl font-bold text-green-600">${product.price}</p>

										<div className="flex items-center text-xs sm:text-sm text-muted-foreground">
											<MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
											<span className="truncate">{product.location}</span>
										</div>

										<div className="flex items-center justify-between pt-1 sm:pt-2">
											<div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
												<Avatar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex-shrink-0">
													<AvatarFallback className="text-xs">
														{((product as any).seller || mockSellerNames[product.userId] || 'Seller')
															.split(' ')
															.map((n: string) => n[0])
															.join('')}
													</AvatarFallback>
												</Avatar>
												<span className="text-xs sm:text-sm text-muted-foreground truncate">
													{(product as any).seller || mockSellerNames[product.userId] || 'Seller'}
												</span>
												{(product as any).sellerProfile?.verified && (
													<span className="text-blue-500" title="Verified seller">
														✓
													</span>
												)}
											</div>
											<span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
												{product.createdAt ? formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true }) : '…'}
											</span>
										</div>

										<div className="flex space-x-1 sm:space-x-2 pt-2">
											<Button
												size="sm"
												className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
												onClick={() => handleProductMessage(product)}
											>
												<MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
												<span className="hidden sm:inline">Message</span>
												<span className="sm:hidden">Msg</span>
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="px-2 sm:px-3 h-8 sm:h-9"
												onClick={() => handleToggleFavorite(product.id)}
												aria-label={favorites.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
											>
												<Heart
													className="h-3 w-3 sm:h-4 sm:w-4"
													fill={favorites.includes(product.id) ? "red" : "none"}
													stroke={favorites.includes(product.id) ? "red" : "currentColor"}
												/>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{!productsLoading && filteredProducts.length === 0 && (
					<div className="text-center py-12">
						<div className="text-6xl mb-4">🔍</div>
						<h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
							{products.length === 0 
								? "No Products Yet" 
								: "No Results Found"
							}
						</h3>
						<p className="text-muted-foreground mb-4">
							{products.length === 0 
								? "No products have been listed yet. Be the first to post something!" 
								: `No products found for ${selectedCategory !== "All" ? `"${selectedCategory}"` : ""}${selectedCategory !== "All" && selectedLocation !== "All Locations" ? " in " : ""}${selectedLocation !== "All Locations" ? `"${selectedLocation}"` : ""}.`
							}
						</p>
						{products.length > 0 && (
							<div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
								<Button
									variant="outline"
									onClick={() => {
										setSelectedCategory("All");
										setSelectedLocation("All Locations");
										setSortBy("newest");
										setPriceRange([0, 2000]);
										setShowPriceFilter(false);
										setSearchTerm("");
									}}
								>
									Clear All Filters
								</Button>
								<span className="text-sm text-gray-500">or</span>
								<Link href="/sell">
									<Button>
										Post a New Item
									</Button>
								</Link>
							</div>
						)}
					</div>
				)}
			</div>



			{/* Chat Interface */}
			<ChatInterface
				currentUserId={user?.uid || ''}
				currentUserName={userProfile?.displayName || ''}
				isOpen={isMessagesOpen}
				onClose={() => {
					setIsMessagesOpen(false)
					setSelectedRecipient(null)
					setSelectedProduct(null)
				}}
				initialRecipientId={selectedRecipient?.id}
				initialRecipientName={selectedRecipient?.name}
				productId={selectedProduct?.id}
				productTitle={selectedProduct?.title}
			/>
		</div>
	)
}