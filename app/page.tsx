"use client"

import React, { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { Timestamp } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"

import { auth } from "@/firebase"
import { Button } from "@components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@components/ui/sheet"
import { Slider } from "@components/ui/slider"
import { Label } from "@components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@components/ui/pagination"
import { Alert, AlertDescription } from "@components/ui/alert"
import { useSocket } from "../hooks/use-socket"
import { subscribeToProducts, type Product } from "../lib/firebase-utils"
import { getUserProfile, type UserProfile } from "../lib/user-utils"

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
	const [showPriceFilter, setShowPriceFilter] = useState(false)
	
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

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10

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

	// Get current items for pagination
	const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

	// Calculate total pages for pagination
	const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: "smooth" })
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
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				<span className="ml-2">Loading...</span>
			</div>
		)
	}

	// Error boundary fallback UI
	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Alert>
					<AlertDescription>
						{error}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="container max-w-7xl mx-auto px-4 py-8">
			{/* Header with filters */}
			<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
				<h1 className="text-3xl font-bold mb-4 md:mb-0">Marketplace</h1>
				<div className="flex flex-col md:flex-row md:items-center gap-4">
					<Button variant="outline" onClick={() => setShowPriceFilter(!showPriceFilter)}>
						Filter by Price
					</Button>
					
					{/* Search input */}
					<input
						type="text"
						placeholder="Search products..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					
					{/* Sort by dropdown */}
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-full md:w-auto">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">Newest First</SelectItem>
							<SelectItem value="oldest">Oldest First</SelectItem>
							<SelectItem value="priceAsc">Price: Low to High</SelectItem>
							<SelectItem value="priceDesc">Price: High to Low</SelectItem>
						</SelectContent>
					</Select>
					
					{/* Category filter */}
					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="w-full md:w-auto">
							<SelectValue placeholder="Select category" />
						</SelectTrigger>
						<SelectContent>
							{categories.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					
					{/* Location filter */}
					<Select value={selectedLocation} onValueChange={setSelectedLocation}>
						<SelectTrigger className="w-full md:w-auto">
							<SelectValue placeholder="Select location" />
						</SelectTrigger>
						<SelectContent>
							{locations.map((location) => (
								<SelectItem key={location} value={location}>
									{location}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Products grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{productsLoading ? (
					<div className="col-span-full text-center py-8">
						<div className="flex items-center justify-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
							<span className="ml-2 text-gray-600">Loading products...</span>
						</div>
					</div>
				) : paginatedProducts.length === 0 ? (
					<div className="col-span-full text-center py-8">
						<Alert>
							<AlertDescription>
								No products found matching your criteria. Total products: {products.length}, Filtered: {filteredProducts.length}
							</AlertDescription>
						</Alert>
					</div>
				) : (
					paginatedProducts.map((product) => (
						<Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
							<CardHeader>
								<CardTitle className="text-lg font-semibold">{product.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col sm:flex-row sm:items-center mb-4">
									<div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
										<Avatar>
											<AvatarFallback>
												{product.seller?.[0]?.toUpperCase() || 
												 product.sellerProfile?.displayName?.[0]?.toUpperCase() || 
												 "U"}
											</AvatarFallback>
										</Avatar>
									</div>
									<div className="flex-grow">
										<p className="text-sm text-gray-500">
											{product.location} • {" "}
											{formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true })}
										</p>
										<h2 className="text-xl font-bold">
											${Number(product.price).toFixed(2)}
										</h2>
									</div>
								</div>
								<p className="text-gray-700 line-clamp-3">
									{product.description}
								</p>
								<div className="mt-2">
									<span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
										{product.category}
									</span>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-8">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious 
									href="#" 
									onClick={(e) => {
										e.preventDefault();
										if (currentPage > 1) handlePageChange(currentPage - 1);
									}}
									className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
								/>
							</PaginationItem>
							{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
								let page;
								if (totalPages <= 5) {
									page = i + 1;
								} else if (currentPage <= 3) {
									page = i + 1;
								} else if (currentPage >= totalPages - 2) {
									page = totalPages - 4 + i;
								} else {
									page = currentPage - 2 + i;
								}
								return (
									<PaginationItem key={page}>
										<PaginationLink
											href="#"
											onClick={(e) => {
												e.preventDefault();
												handlePageChange(page);
											}}
											isActive={currentPage === page}
										>
											{page}
										</PaginationLink>
									</PaginationItem>
								);
							})}
							<PaginationItem>
								<PaginationNext 
									href="#" 
									onClick={(e) => {
										e.preventDefault();
										if (currentPage < totalPages) handlePageChange(currentPage + 1);
									}}
									className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}

			{/* Price range filter sheet */}
			<Sheet open={showPriceFilter} onOpenChange={setShowPriceFilter}>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Filter by Price</SheetTitle>
					</SheetHeader>
					<div className="p-4">
						<Label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-4">
							Price range: ${priceRange[0]} - ${priceRange[1]}
						</Label>
						<Slider
							id="price-range"
							value={priceRange}
							onValueChange={setPriceRange}
							min={0}
							max={2000}
							step={10}
							className="mt-2"
						/>
						<div className="flex justify-between text-xs text-gray-500 mt-2">
							<span>$0</span>
							<span>$2000</span>
						</div>
					</div>
					<div className="flex justify-end p-4 gap-2">
						<Button 
							variant="outline" 
							onClick={() => setShowPriceFilter(false)}
						>
							Cancel
						</Button>
						<Button onClick={() => setShowPriceFilter(false)}>
							Apply
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	)
}