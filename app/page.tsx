"use client"

import React, { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"

import { auth } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, Plus, Filter, Search, MapPin, Menu, X } from "lucide-react"

// Import hooks and utilities
import { useSocket } from "@/hooks/use-socket"
import { subscribeToProducts as subscribeToRealProducts, deleteProduct, type Product } from "@/lib/firebase-utils"
import { subscribeMockProducts } from "@/lib/mock-data-utils"
import { getUserProfile, type UserProfile } from "@/lib/user-utils"

// Type definitions for component compatibility
interface MarketplaceNavUser {
	displayName?: string | undefined
	photoURL?: string | undefined
	email?: string | undefined
}

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
		toDate: () => Date
		toMillis: () => number
	}
	views?: number
	condition?: string
	tags?: string[]
}

// Import components
import { MarketplaceNav } from "@/components/marketplace-nav"
import { ProductCard } from "@/components/product-card"

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

// Categories for filtering
const categories = ["All", "Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden", "Automotive", "Other"]

// Enhanced Sidebar Component with Mobile Support
const EnhancedSidebar: React.FC<{
	selectedCategory: string
	onCategoryChange: (category: string) => void
	onCreateListing: () => void
	onOpenChat: () => void
	selectedLocation: string
	onLocationChange: (location: string) => void
	onPriceFilterClick: () => void
	sortBy: string
	onSortChange: (sort: string) => void
	isOpen: boolean
	onClose: () => void
	isMobile: boolean
}> = ({ 
	selectedCategory, 
	onCategoryChange, 
	onCreateListing, 
	onOpenChat,
	selectedLocation,
	onLocationChange,
	onPriceFilterClick,
	sortBy,
	onSortChange,
	isOpen,
	onClose,
	isMobile
}) => {
	const sidebarContent = (
		<div className="space-y-6">
			{/* Mobile Close Button */}
			{isMobile && (
				<div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			)}

			{/* Quick Actions */}
			<div className="space-y-3">
				<Button onClick={onCreateListing} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" size="sm">
					<Plus className="w-4 h-4 mr-2" />
					Create Listing
				</Button>
				<Button onClick={onOpenChat} variant="outline" className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" size="sm">
					<MessageCircle className="w-4 h-4 mr-2" />
					Open Chat
				</Button>
			</div>

			{/* Categories */}
			<div>
				<h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Categories</h3>
				<div className="space-y-1">
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => {
								onCategoryChange(category)
								if (isMobile) onClose()
							}}
							className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
								selectedCategory === category
									? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
									: "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
							}`}
						>
							{category}
						</button>
					))}
				</div>
			</div>

			{/* Location Filter */}
			<div>
				<h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Location</h3>
				<Select value={selectedLocation} onValueChange={onLocationChange}>
					<SelectTrigger className="w-full border-gray-300 dark:border-gray-600">
						<SelectValue placeholder="Select location" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="All Locations">All Locations</SelectItem>
						{locationData.map((location) => (
							<SelectItem key={location.name} value={location.name}>
								{location.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Sort Options */}
			<div>
				<h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Sort By</h3>
				<Select value={sortBy} onValueChange={onSortChange}>
					<SelectTrigger className="w-full border-gray-300 dark:border-gray-600">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="newest">Newest First</SelectItem>
						<SelectItem value="oldest">Oldest First</SelectItem>
						<SelectItem value="priceAsc">Price: Low to High</SelectItem>
						<SelectItem value="priceDesc">Price: High to Low</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Price Filter */}
			<div>
				<Button 
					variant="outline" 
					size="sm" 
					onClick={onPriceFilterClick}
					className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
				>
					<Filter className="w-4 h-4 mr-2" />
					Price Filter
				</Button>
			</div>
		</div>
	)

	if (isMobile) {
		return (
			<Sheet open={isOpen} onOpenChange={onClose}>
				<SheetContent side="left" className="w-80 p-6 bg-white dark:bg-gray-800">
					{sidebarContent}
				</SheetContent>
			</Sheet>
		)
	}

	return (
		<div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
			{sidebarContent}
		</div>
	)
}

export default function MarketplacePage() {
	// Configuration: Set this to true to use mock products during development
	const useMockProducts = true
	
	const router = useRouter()
	
	// Mobile state
	const [isMobile, setIsMobile] = useState(false)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	
	// Filter and UI state
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [selectedLocation, setSelectedLocation] = useState("All Locations")
	const [searchTerm, setSearchTerm] = useState("")
	const [sortBy, setSortBy] = useState("newest")
	const [showPriceFilter, setShowPriceFilter] = useState(false)
	const [priceRange, setPriceRange] = useState([0, 2000])
	const [isChatOpen, setIsChatOpen] = useState(false)
	
	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(20)
	
	// Auth and user state
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
	const [user, setUser] = useState<User | null>(null)
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [favorites, setFavorites] = useState<string[]>([])

	// Products state
	const [products, setProducts] = useState<ProductCardProduct[]>([])
	const [productsLoading, setProductsLoading] = useState(true)

	// Check if mobile on mount and window resize
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}
		
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

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
				console.error("Auth error:", err)
				setError("Failed to load user data: " + (err?.message || "Unknown error"))
			} finally {
				setLoading(false)
			}
		})
		return () => unsubscribe()
	}, [])

	// Subscribe to products from Firebase OR use mock data
	useEffect(() => {
		setProductsLoading(true)

		let unsubscribe: () => void

		if (useMockProducts) {
			console.log('Using mock products...')
			unsubscribe = subscribeMockProducts((mockProducts) => {
				console.log('Received mock products:', mockProducts.length, 'products')
				const transformedProducts: ProductCardProduct[] = mockProducts.map(product => ({
					...product,
					userId: product.sellerId,
					seller: product.sellerName,
					sellerProfile: {
						displayName: product.sellerName,
						photoURL: product.sellerAvatar
					},
					createdAt: {
						toDate: () => new Date(),
						toMillis: () => Date.now()
					}
				}))
				setProducts(transformedProducts)
				setProductsLoading(false)
			})
		} else {
			console.log('Using real Firebase products...')
			unsubscribe = subscribeToRealProducts((firebaseProducts) => {
				console.log('Received real products from Firebase:', firebaseProducts.length, 'products')
				const transformedProducts: ProductCardProduct[] = firebaseProducts.map(product => ({
					...product,
					userId: product.seller || product.sellerId || '',
					sellerId: product.seller || product.sellerId,
					sellerProfile: product.sellerProfile ? {
						displayName: product.sellerProfile.displayName,
						photoURL: product.sellerProfile.avatar
					} : undefined
				}))
				setProducts(transformedProducts)
				setProductsLoading(false)
			})
		}

		return () => unsubscribe()
	}, [useMockProducts])

	// Filter and sort products based on user selections
	const filteredProducts = products.filter((product) => {
		const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
		const matchesLocation = selectedLocation === "All Locations" || product.location === selectedLocation
		const matchesSearch = searchTerm === "" || 
			product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.description.toLowerCase().includes(searchTerm.toLowerCase())
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

	// Pagination calculations
	const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const paginatedProducts = sortedProducts.slice(startIndex, endIndex)

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	// Handle actions
	const handleProductClick = (productId: string) => {
		console.log('Product clicked:', productId)
		router.push(`/products/${productId}`)
	}

	const handleFavoriteClick = (productId: string) => {
		console.log('Favorite clicked:', productId)
		setFavorites(prev => 
			prev.includes(productId) 
				? prev.filter(id => id !== productId)
				: [...prev, productId]
		)
	}

	const handleMessageClick = (productId: string) => {
		console.log('Message clicked:', productId)
		setIsChatOpen(true)
		router.push(`/messages?product=${productId}`)
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
		// if (!window.confirm('Are you sure you want to delete this listing?')) {
		// 	return
		// }
		
		try {
			await deleteProduct(productId, user.uid)
			console.log('Product deleted successfully')
		} catch (error: any) {
			console.error('Failed to delete product:', error.message)
			setError('Failed to delete listing: ' + error.message)
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

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1)
	}, [selectedCategory, selectedLocation, searchTerm, priceRange, sortBy])

	// Show loading state while initializing
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">Loading Marketplace...</p>
				</div>
			</div>
		)
	}

	// Error boundary fallback UI
	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
				<Alert className="max-w-md">
					<AlertDescription>
						{error}
						<Button 
							variant="outline" 
							size="sm" 
							className="mt-2"
							onClick={() => window.location.reload()}
						>
							Retry
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
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

			<div className="flex">
				{/* Enhanced Sidebar */}
				<EnhancedSidebar
					selectedCategory={selectedCategory}
					onCategoryChange={setSelectedCategory}
					onCreateListing={handleCreateListing}
					onOpenChat={handleOpenChat}
					selectedLocation={selectedLocation}
					onLocationChange={setSelectedLocation}
					onPriceFilterClick={() => setShowPriceFilter(true)}
					sortBy={sortBy}
					onSortChange={setSortBy}
					isOpen={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
					isMobile={isMobile}
				/>

				{/* Main content */}
				<div className="flex-1 p-4 md:p-6">
					{/* Mobile Filter Toggle */}
					{isMobile && (
						<div className="mb-4 flex items-center justify-between">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSidebarOpen(true)}
								className="border-gray-300 dark:border-gray-600"
							>
								<Menu className="h-4 w-4 mr-2" />
								Filters
							</Button>
							<div className="text-sm text-gray-500 dark:text-gray-400">
								{sortedProducts.length} results
							</div>
						</div>
					)}

					{/* Search bar for mobile */}
					{isMobile && (
						<div className="mb-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									type="text"
									placeholder="Search products..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 border-gray-300 dark:border-gray-600"
								/>
							</div>
						</div>
					)}

					{/* Results header */}
					<div className="mb-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
									{selectedCategory === "All" ? "All listings" : selectedCategory}
								</h2>
								<p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
									{productsLoading ? (
										"Loading products..."
									) : (
										<>
											{sortedProducts.length} listing{sortedProducts.length !== 1 ? 's' : ''} found
											{selectedLocation !== "All Locations" && (
												<Badge variant="secondary" className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
													📍 {selectedLocation}
												</Badge>
											)}
											{searchTerm && (
												<Badge variant="secondary" className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
													🔍 "{searchTerm}"
												</Badge>
											)}
										</>
									)}
								</p>
							</div>
							
							{/* Page indicator */}
							{totalPages > 1 && !isMobile && (
								<div className="text-sm text-gray-500 dark:text-gray-400">
									Page {currentPage} of {totalPages}
								</div>
							)}
						</div>
					</div>

					{/* Products grid */}
					{productsLoading ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
							{Array.from({ length: 10 }).map((_, index) => (
								<div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse border border-gray-200 dark:border-gray-700">
									<div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								</div>
							))}
						</div>
					) : sortedProducts.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-gray-400 dark:text-gray-500 mb-4">
								<div className="w-20 md:w-24 h-20 md:h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
									<span className="text-3xl md:text-4xl">📦</span>
								</div>
							</div>
							<h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No listings found</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base">
								{searchTerm || selectedLocation !== "All Locations" || selectedCategory !== "All"
									? "Try adjusting your filters or search terms"
									: "Be the first to list an item in this marketplace!"
								}
							</p>
							<div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
								<Button onClick={handleCreateListing} size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
									<Plus className="w-4 h-4 mr-2" />
									Create Listing
								</Button>
								{(searchTerm || selectedLocation !== "All Locations" || selectedCategory !== "All") && (
									<Button 
										variant="outline" 
										size="sm"
										className="border-gray-300 dark:border-gray-600"
										onClick={() => {
											setSearchTerm("")
											setSelectedLocation("All Locations")
											setSelectedCategory("All")
											setPriceRange([0, 2000])
										}}
									>
										Clear Filters
									</Button>
								)}
							</div>
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
							{paginatedProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									currentUserId={user?.uid}
									onProductClick={handleProductClick}
									onFavoriteClick={handleFavoriteClick}
									onMessageClick={handleMessageClick}
									onDeleteClick={handleDeleteProduct}
									onUserClick={handleUserClick}
									isFavorited={favorites.includes(product.id)}
									showDeleteButton={user?.uid === (product.sellerId || product.userId)}
								/>
							))}
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

			{/* Price range filter sheet */}
			<Sheet open={showPriceFilter} onOpenChange={setShowPriceFilter}>
				<SheetContent className="bg-white dark:bg-gray-800">
					<SheetHeader>
						<SheetTitle className="text-gray-900 dark:text-gray-100">Filter by Price</SheetTitle>
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
							<div className="flex justify-between text-xs text-gray-500 mt-2">
								<span>$0</span>
								<span>$2000</span>
							</div>
						</div>
					</div>
					<div className="flex justify-end p-4 gap-2">
						<Button 
							variant="outline" 
							className="border-gray-300 dark:border-gray-600"
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
		</div>
	)
}