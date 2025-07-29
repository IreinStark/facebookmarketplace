"use client"

import React, { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { Timestamp } from "firebase/firestore"

import { auth } from "@/firebase"
import { Alert, AlertDescription } from "@components/ui/alert"
import { useSocket } from "../hooks/use-socket"
import { subscribeToProducts, type Product } from "../lib/firebase-utils"
import { getUserProfile, type UserProfile } from "../lib/user-utils"

// Import new components
import { MarketplaceNav } from "../components/marketplace-nav"
import { MarketplaceSidebar } from "../components/marketplace-sidebar"
import { ProductCard } from "../components/product-card"

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

// Categories for filtering (matching the sell page categories)
const categories = ["All", "Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden", "Automotive", "Other"]

export default function MarketplacePage() {
	// Filter and UI state
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [selectedLocation, setSelectedLocation] = useState("All Locations")
	const [searchTerm, setSearchTerm] = useState("")
	const [sortBy, setSortBy] = useState("newest")
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
	
	// Auth and user state
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
	const [user, setUser] = useState<User | null>(null)
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [favorites, setFavorites] = useState<string[]>([])

	// Products state
	const [products, setProducts] = useState<Product[]>([])
	const [productsLoading, setProductsLoading] = useState(true)

	// Extract unique locations from products for filtering
	const locations = React.useMemo(() => {
		if (!products || products.length === 0) {
			return ["All Locations"]
		}
		const uniqueLocations = Array.from(new Set(products.map(product => product.location).filter(Boolean)))
		return ["All Locations", ...uniqueLocations]
	}, [products])

	// Initialize Socket.io for real-time chat
	useSocket({
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

	// Subscribe to products from Firebase
	useEffect(() => {
		setProductsLoading(true)

		// Subscribe to products updates
		const unsubscribe = subscribeToProducts((products) => {
			console.log('Received products from Firebase:', products.length, 'products')
			setProducts(products)
			setProductsLoading(false)
		})

		// Cleanup subscription on unmount
		return () => unsubscribe()
	}, [])

	// Filter and sort products based on user selections
	const filteredProducts = products.filter((product) => {
		const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
		const matchesLocation = selectedLocation === "All Locations" || product.location === selectedLocation
		const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

		return matchesCategory && matchesLocation && matchesSearch && matchesPrice
	})

	const sortedProducts = [...filteredProducts].sort((a, b) => {
		if (sortBy === "newest") {
			return b.createdAt.toMillis() - a.createdAt.toMillis()
		} else if (sortBy === "oldest") {
			return a.createdAt.toMillis() - b.createdAt.toMillis()
		} else if (sortBy === "priceAsc") {
			return a.price - b.price
		} else if (sortBy === "priceDesc") {
			return b.price - a.price
		}
		return 0
	})

	// Handle actions
	const handleProductClick = (productId: string) => {
		console.log('Product clicked:', productId)
		// Navigate to product detail page
	}

	const handleFavoriteClick = (productId: string) => {
		console.log('Favorite clicked:', productId)
		// Toggle favorite status
	}

	const handleMessageClick = (productId: string) => {
		console.log('Message clicked:', productId)
		// Open chat with seller
	}

	const handleCreateListing = () => {
		console.log('Create listing clicked')
		// Navigate to create listing page
	}

	// Refresh user profile and favorites periodically
	useEffect(() => {
		const interval = setInterval(() => {
			if (isLoggedIn && user) {
				getUserProfile(user).then((profile) => {
					setUserProfile(profile)
				}).catch((err) => {
					console.error("Error fetching user profile: ", err)
				})
			}
		}, 5 * 60 * 1000) // Refresh every 5 minutes

		return () => clearInterval(interval)
	}, [isLoggedIn, user])

	// Show loading state while initializing
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading Marketplace...</p>
				</div>
			</div>
		)
	}

	// Error boundary fallback UI
	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<Alert className="max-w-md">
					<AlertDescription>
						{error}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navigation */}
			<MarketplaceNav 
				user={user}
				onSearch={setSearchTerm}
				searchValue={searchTerm}
			/>

			<div className="flex">
				{/* Sidebar */}
				<MarketplaceSidebar
					selectedCategory={selectedCategory}
					selectedLocation={selectedLocation}
					priceRange={priceRange}
					categories={categories}
					locations={locations}
					onCategoryChange={setSelectedCategory}
					onLocationChange={setSelectedLocation}
					onPriceRangeChange={setPriceRange}
					onCreateListing={handleCreateListing}
				/>

				{/* Main content */}
				<div className="flex-1 p-6">
					{/* Results header */}
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							{selectedCategory === "All" ? "All listings" : selectedCategory}
						</h2>
						<p className="text-gray-600">
							{productsLoading ? (
								"Loading products..."
							) : (
								`${sortedProducts.length} listing${sortedProducts.length !== 1 ? 's' : ''} found`
							)}
							{selectedLocation !== "All Locations" && ` in ${selectedLocation}`}
						</p>
					</div>

					{/* Products grid */}
					{productsLoading ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{Array.from({ length: 10 }).map((_, index) => (
								<div key={index} className="bg-white rounded-lg p-4 animate-pulse">
									<div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
									<div className="h-4 bg-gray-200 rounded mb-2"></div>
									<div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
									<div className="h-3 bg-gray-200 rounded w-1/2"></div>
								</div>
							))}
						</div>
					) : sortedProducts.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-gray-400 mb-4">
								<div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
									<span className="text-4xl">📦</span>
								</div>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
							<p className="text-gray-600 mb-4">
								Try adjusting your filters or search terms
							</p>
							<p className="text-sm text-gray-500">
								Total products: {products.length}, Filtered: {filteredProducts.length}
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{sortedProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									onProductClick={handleProductClick}
									onFavoriteClick={handleFavoriteClick}
									onMessageClick={handleMessageClick}
									isFavorited={favorites.includes(product.id)}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}