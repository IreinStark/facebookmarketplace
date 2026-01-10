"use client"

import React, { useState, useEffect, useRef } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"

import { auth } from "@/app/firebase"
import { Button } from "@/components/ui/button"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, Plus, Filter, Search, Menu, X } from "lucide-react"

// Import hooks and utilities
import { useSocket } from "@/hooks/use-socket"
import { subscribeToProducts as subscribeToRealProducts, deleteProduct } from "@/lib/firebase-utils"
import { subscribeMockProducts } from "@/lib/mock-data-utils"
import { getUserProfile, updateUserProfile, getCurrentLocation, findClosestLocation, getLocationErrorMessage, type UserProfile } from "@/lib/user-utils"

// Type definitions for component compatibility
interface ProductCardProduct {
	id: string
	title: string
	price: number
	description: string
	category: string
	location: string
	images?: string[]
	seller?: string
	userId: string
	sellerId?: string
	sellerName?: string
	sellerAvatar?: string
	sellerProfile?: {
		displayName?: string
		photoURL?: string
	}
	createdAt: {
		toDate?: () => Date
		toMillis?: () => number
	} | Date | string | number
	views?: number
	condition?: string
	tags?: string[]
}

// Import components
import { MarketplaceNav } from "@/components/marketplace-nav"
import { MarketplaceBottomNav } from "@/components/marketplace-sidebar"
import { MarketplaceSidebar } from "@/components/marketplace-sidebar"
import { ProductCard } from "@/components/product-card"
import { LocationPopup } from "@/components/location-popup"

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

import { MARKETPLACE_CATEGORIES } from "@/lib/constants"

export default function MarketplacePage() {
	const [user, setUser] = useState<User | null>(null)
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isMobile, setIsMobile] = useState(false)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [showPriceFilter, setShowPriceFilter] = useState(false)
	const [isChatOpen, setIsChatOpen] = useState(false)
	const [showLocationPopup, setShowLocationPopup] = useState(false)

	// Filter states
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [selectedLocation, setSelectedLocation] = useState(() => {
		// Initialize from localStorage if available, otherwise default to "All Locations"
		if (typeof window !== 'undefined') {
			return localStorage.getItem('selectedLocation') || "All Locations"
		}
		return "All Locations"
	})
	const [searchTerm, setSearchTerm] = useState("")
	const [priceRange, setPriceRange] = useState([0, 2000])
	const [sortBy, setSortBy] = useState("recent")

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const itemsPerPage = 20

	// Product states
	const [products, setProducts] = useState<ProductCardProduct[]>([])
	const [productsLoading, setProductsLoading] = useState(true)
	const hasInitializedLocationRef = useRef(false)

	const router = useRouter()
	
	// Initialize socket only after user is loaded (disabled for now)
	const { socket, isConnected } = useSocket(process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true' ? user : null)

	const isLoggedIn = !!user

	// Check if user is authenticated
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setUser(user)
				try {
					const profile = await getUserProfile(user)
					setUserProfile(profile)
				} catch (error: unknown) {
					console.error('Failed to load user profile:', error)
				}
			} else {
				setUser(null)
				setUserProfile(null)
				// Reset location popup flag when user signs out so it shows again on next sign in
				localStorage.removeItem('hasSeenLocationPopup')
				// Keep the selected location preference even after sign out
			}
			setLoading(false)
		})

		return () => unsubscribe()
	}, [])

	// Show location popup after sign in
	useEffect(() => {
		// Only show popup if user is logged in and hasn't seen it yet
		if (user && !loading) {
			const hasSeenLocationPopup = localStorage.getItem('hasSeenLocationPopup')
			if (!hasSeenLocationPopup) {
				// Small delay to ensure the page is fully loaded after sign in
				const timer = setTimeout(() => {
					setShowLocationPopup(true)
				}, 1500)
				return () => clearTimeout(timer)
			}
		}
	}, [user, loading])

	// Persist selected location to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('selectedLocation', selectedLocation)
		}
	}, [selectedLocation])

	// Add utility function to window for testing (development only)
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			;(window as any).resetLocationPopup = () => {
				localStorage.removeItem('hasSeenLocationPopup')
				setShowLocationPopup(true)
			}
			;(window as any).simulateSignIn = () => {
				localStorage.removeItem('hasSeenLocationPopup')
				// This will trigger the popup after a simulated sign in
				setTimeout(() => {
					setShowLocationPopup(true)
				}, 1000)
			}
			;(window as any).resetLocation = () => {
				localStorage.removeItem('selectedLocation')
				setSelectedLocation("All Locations")
			}
		}
	}, [])

	// Check mobile screen size
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}

		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	// Helper function to transform mock products to match ProductCardProduct interface
	const transformMockProducts = (mockProducts: any[]): ProductCardProduct[] => {
		return mockProducts.map(product => ({
			...product,
			userId: product.sellerId || product.userId || 'mock-user-id', // Ensure userId is always present
			sellerId: product.sellerId || product.userId || 'mock-user-id',
		}))
	}

	// Subscribe to products
	useEffect(() => {
		let unsubscribe: (() => void) | undefined

		const subscribeToProducts = async () => {
			setProductsLoading(true)
			try {
				// Try to subscribe to real products first
				unsubscribe = subscribeToRealProducts(
					(products) => {
						setProducts(products)
						setProductsLoading(false)
					}
				)
			} catch (error: unknown) {
				console.error('Error subscribing to products:', error)
				// Check if it's a permission error
				if (error instanceof Error && error.message.includes('permission-denied')) {
					console.log('Permission denied, falling back to mock products')
				}
				// Fallback to mock products with type transformation
				subscribeMockProducts((mockProducts) => {
					const transformedProducts = transformMockProducts(mockProducts)
					setProducts(transformedProducts)
					setProductsLoading(false)
				})
			}
		}

		subscribeToProducts()

		return () => {
			if (unsubscribe) {
				unsubscribe()
			}
		}
	}, [])

	// Filter and sort products
	const filteredProducts = products.filter(product => {
		const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
		const matchesLocation = selectedLocation === "All Locations" || product.location === selectedLocation
		const matchesSearch = !searchTerm || 
			product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.category.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

		return matchesCategory && matchesLocation && matchesSearch && matchesPrice
	})

	// Helper function to get timestamp from createdAt field
	const getTimestamp = (createdAt: any): number => {
		if (!createdAt) return 0
		
		// If it's a Firebase Timestamp with toMillis method
		if (typeof createdAt.toMillis === 'function') {
			return createdAt.toMillis()
		}
		
		// If it's a Date object
		if (createdAt instanceof Date) {
			return createdAt.getTime()
		}
		
		// If it's a string date
		if (typeof createdAt === 'string') {
			return new Date(createdAt).getTime()
		}
		
		// If it's already a number (timestamp)
		if (typeof createdAt === 'number') {
			return createdAt
		}
		
		// If it has a toDate method (Firebase Timestamp)
		if (typeof createdAt.toDate === 'function') {
			return createdAt.toDate().getTime()
		}
		
		return 0
	}

	// Sort products
	const sortedProducts = [...filteredProducts].sort((a, b) => {
		switch (sortBy) {
			case "price-low":
				return a.price - b.price
			case "price-high":
				return b.price - a.price
			case "recent":
				return getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
			case "popular":
				return (b.views || 0) - (a.views || 0)
			default:
				return getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
		}
	})

	// Paginate products
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const paginatedProducts = sortedProducts.slice(startIndex, endIndex)

	// Calculate total pages
	useEffect(() => {
		setTotalPages(Math.ceil(sortedProducts.length / itemsPerPage))
		if (currentPage > Math.ceil(sortedProducts.length / itemsPerPage)) {
			setCurrentPage(1)
		}
	}, [sortedProducts.length, currentPage])

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleProductClick = (productId: string) => {
		router.push(`/products/${productId}`)
	}

	const handleFavoriteClick = (productId: string) => {
		if (!isLoggedIn) {
			router.push('/auth/login')
			return
		}
		// TODO: Implement favorite functionality
		console.log('Favorite clicked:', productId)
	}

	const handleMessageClick = (productId: string) => {
		if (!isLoggedIn) {
			router.push('/auth/login')
			return
		}
		// Find the product to get seller information
		const product = products.find(p => p.id === productId)
		if (product && product.userId !== user?.uid) {
			// Navigate to messages with conversation context
			const sellerId = product.userId
			const sellerName = product.sellerProfile?.displayName || product.sellerName || product.seller || 'Anonymous'
			const queryParams = new URLSearchParams({
				recipientId: sellerId,
				recipientName: sellerName,
				productId: productId,
				productTitle: product.title
			})
			router.push(`/messages?${queryParams.toString()}`)
		}
	}

	const handleDeleteProduct = async (productId: string) => {
		if (!user) {
			console.error('User not authenticated')
			return
		}
		
		// IMPORTANT: Replaced window.confirm with a console log.
		// For a production app, you should implement a custom modal/dialog
		// for user confirmation instead of window.confirm/alert.
		console.log('Confirming deletion for product:', productId);
		
		// Simple confirmation using confirm - you can replace with a custom modal
		const confirmed = confirm('Are you sure you want to delete this listing?')
		if (!confirmed) {
			return
		}
		
		try {
			await deleteProduct(productId, user.uid)
			console.log('Product deleted successfully')
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			console.error('Failed to delete product:', errorMessage)
			setError('Failed to delete listing: ' + errorMessage)
		}
	}

	const handleUserClick = (userId: string) => {
		router.push(`/user/${userId}`)
	}

	const handleCreateListing = () => {
		if (isLoggedIn) {
			router.push('/sell')
		} else {
			router.push('/auth/login')
		}
	}

	const handleOpenChat = () => {
		if (isLoggedIn) {
			setIsChatOpen(true)
			router.push('/messages')
		} else {
			router.push('/auth/login')
		}
	}

	const handleLocationDetect = () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by this browser.")
			return
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords
				console.log("Detected location:", { latitude, longitude })
				
				const closestLocation = findClosestLocation(latitude, longitude, locationData)
				setSelectedLocation(closestLocation.name)
				localStorage.setItem('selectedLocation', closestLocation.name)
			},
			(error) => {
				console.error("Location detection failed:", error)
				alert(getLocationErrorMessage(error))
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 300000 // 5 minutes
			}
		)
	}

	const handleLocationSelect = (location: string) => {
		setSelectedLocation(location)
		localStorage.setItem('hasSeenLocationPopup', 'true')
		setShowLocationPopup(false)
	}

	const handleLocationPopupClose = () => {
		localStorage.setItem('hasSeenLocationPopup', 'true')
		setShowLocationPopup(false)
		// Don't reset the location when popup is closed - keep user's current selection
	}

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1)
	}, [selectedCategory, selectedLocation, searchTerm, priceRange, sortBy])

	// Show loading state while initializing
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-300">Loading Marketplace...</p>
				</div>
			</div>
		)
	}

	// Error boundary fallback UI
	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4 transition-colors">
				<Alert className="max-w-md">
					<AlertDescription>
						{error}
						<Button 
							variant="outline" 
							size="sm" 
							className="mt-2"
							onClick={() => {
								setError(null)
								window.location.reload()
							}}
						>
							Retry
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
			{/* Navigation */}
			<MarketplaceNav 
				user={user}
				onSearch={setSearchTerm}
				onLocationChange={setSelectedLocation}
				searchValue={searchTerm}
				selectedLocation={selectedLocation}
				onMenuClick={() => setSidebarOpen(true)}
				isMobile={isMobile}
			/>
			
			{/* Desktop Horizontal Navigation Bar */}
			{!isMobile && (
				<MarketplaceBottomNav
					selectedCategory={selectedCategory}
                    categories={MARKETPLACE_CATEGORIES}
					onCategoryChange={setSelectedCategory}
					onCreateListing={handleCreateListing}
					selectedLocation={selectedLocation}
					onLocationChange={setSelectedLocation}
					onLocationPopupOpen={() => setShowLocationPopup(true)}
					user={user}
					isMobile={isMobile}
					onDetectLocation={handleLocationDetect}
				/>
			)}

			{/* Main content - full width without sidebar */}
            <div className="container max-w-7xl mx-auto px-4 py-6">
				<div className="pb-20"> {/* Added bottom padding for mobile bottom nav */}
				{/* Mobile Filter Toggle */}
				{isMobile && (
					<div className="mb-4 flex items-center justify-between">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setSidebarOpen(true)}
							className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
						>
							<Menu className="h-4 w-4 mr-2" />
							Filters
						</Button>
						<div className="text-sm text-gray-500">
                            {sortedProducts.length} results
						</div>
					</div>
				)}

				{/* Search bar for mobile */}
                {isMobile && (
					<div className="mb-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
							<Input
								type="text"
								placeholder="Search products..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
							/>
						</div>
					</div>
				)}

				{/* Results header */}
                <div className="mb-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
								{selectedCategory === "All" ? "All listings" : selectedCategory}
							</h2>
							<div className="text-gray-600 text-sm md:text-base">
								{productsLoading ? (
									"Loading products..."
								) : (
									<>
										{sortedProducts.length} listing{sortedProducts.length !== 1 ? 's' : ''} found
										{selectedLocation !== "All Locations" && (
											<Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
												 📍 {selectedLocation}
											</Badge>
										)}
										{searchTerm && (
											<Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
												 🔍 &quot;{searchTerm}&quot;
											</Badge>
										)}
									</>
								)}
							</div>
						</div>
						
						
						{/* Page indicator */}
						{totalPages > 1 && !isMobile && (
							<div className="text-sm text-gray-500">
								Page {currentPage} of {totalPages}
							</div>
						)}
					</div>
				</div>

					{/* Products grid */}
					{productsLoading ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
							{Array.from({ length: 10 }).map((_, index) => (
								<div key={index} className="bg-white dark:bg-black rounded-lg p-4 animate-pulse border border-gray-200 dark:border-gray-800">
									<div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								</div>
							))}
						</div>
					) : paginatedProducts.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                            {paginatedProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									onProductClick={() => handleProductClick(product.id)}
									onFavoriteClick={() => handleFavoriteClick(product.id)}
									onMessageClick={() => handleMessageClick(product.id)}
									onDeleteClick={() => handleDeleteProduct(product.id)}
									onUserClick={() => handleUserClick(product.userId)}
									isOwner={user?.uid === product.userId}
									isLoggedIn={isLoggedIn}
									userProfile={userProfile}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<div className="text-gray-400 dark:text-gray-400 mb-4">
								<Search className="h-12 w-12 mx-auto" />
							</div>
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No listings found</h3>
							<p className="text-gray-500 dark:text-gray-400">
								Try adjusting your search criteria or create a new listing.
							</p>
							{isLoggedIn && (
								<Button 
									onClick={handleCreateListing}
									className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
								>
									<Plus className="h-4 w-4 mr-2" />
									Create Listing
								</Button>
							)}
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-8 flex justify-center">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious 
											href="#" 
											onClick={(e: React.MouseEvent) => {
												e.preventDefault();
												if (currentPage > 1) handlePageChange(currentPage - 1);
											}}
											className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
													onClick={(e: React.MouseEvent) => {
														e.preventDefault();
														handlePageChange(page);
													}}
													isActive={currentPage === page}
													className="cursor-pointer"
												>
													{page}
												</PaginationLink>
											</PaginationItem>
										);
									})}
									<PaginationItem>
										<PaginationNext 
											href="#" 
											onClick={(e: React.MouseEvent) => {
												e.preventDefault();
												if (currentPage < totalPages) handlePageChange(currentPage + 1);
											}}
											className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</div>
			</div>

		{/* Mobile Bottom Navigation */}
		{isMobile && (
			<MarketplaceBottomNav
				selectedCategory={selectedCategory}
				categories={MARKETPLACE_CATEGORIES}
				onCategoryChange={setSelectedCategory}
				onCreateListing={handleCreateListing}
				selectedLocation={selectedLocation}
				onLocationChange={setSelectedLocation}
				onLocationPopupOpen={() => setShowLocationPopup(true)}
				user={user}
				isMobile={isMobile}
				onDetectLocation={handleLocationDetect}
			/>
		)}
		
		{/* Price range filter sheet */}
		<Sheet open={showPriceFilter} onOpenChange={setShowPriceFilter}>
				<SheetContent className="bg-white dark:bg-black">
					<SheetHeader>
						<SheetTitle className="text-gray-900 dark:text-white">Filter by Price</SheetTitle>
					</SheetHeader>
					<div className="p-4 space-y-6">
						<div>
							<Label htmlFor="price-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
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
							<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
								<span>$0</span>
								<span>$2000</span>
							</div>
						</div>
					</div>
					<div className="flex justify-end p-4 gap-2">
						<Button 
							variant="outline" 
							className="border-gray-300 dark:border-gray-300"
							onClick={() => {
								setPriceRange([0, 2000])
								setShowPriceFilter(false)
							}}
						>
							Reset
						</Button>
						<Button
							onClick={() => setShowPriceFilter(false)}
							className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
						>
							Apply Filter
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			{/* Location Popup */}
			<LocationPopup
				isOpen={showLocationPopup}
				onClose={handleLocationPopupClose}
				onLocationSelect={handleLocationSelect}
				locationData={locationData}
			/>
		</div>
	)
}