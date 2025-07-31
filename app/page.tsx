"use client"

import React, { useState, useEffect } from "react"
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
import { getUserProfile, type UserProfile } from "@/lib/user-utils"

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
		toDate: () => Date
		toMillis: () => number
	}
	views?: number
	condition?: string
	tags?: string[]
}

// Import components
import { MarketplaceNav } from "@/components/marketplace-nav"
import { MarketplaceBottomNav } from "@/components/marketplace-sidebar"
import { MarketplaceSidebar } from "@/components/marketplace-sidebar"
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

export default function MarketplacePage() {
	const [user, setUser] = useState<User | null>(null)
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isMobile, setIsMobile] = useState(false)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [showPriceFilter, setShowPriceFilter] = useState(false)
	const [isChatOpen, setIsChatOpen] = useState(false)

	// Filter states
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [selectedLocation, setSelectedLocation] = useState("All Locations")
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

	const router = useRouter()
	const { socket } = useSocket()

	const isLoggedIn = !!user

	// Check if user is authenticated
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setUser(user)
				try {
					const profile = await getUserProfile(user.uid)
					setUserProfile(profile)
				} catch (error) {
					console.error('Failed to load user profile:', error)
				}
			} else {
				setUser(null)
				setUserProfile(null)
			}
			setLoading(false)
		})

		return () => unsubscribe()
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
					},
					(error) => {
						console.error('Failed to subscribe to real products:', error)
						// Fallback to mock products
						subscribeMockProducts((mockProducts) => {
							setProducts(mockProducts)
							setProductsLoading(false)
						})
					}
				)
			} catch (error) {
				console.error('Error subscribing to products:', error)
				// Fallback to mock products
				subscribeMockProducts((mockProducts) => {
					setProducts(mockProducts)
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

	// Sort products
	const sortedProducts = [...filteredProducts].sort((a, b) => {
		switch (sortBy) {
			case "price-low":
				return a.price - b.price
			case "price-high":
				return b.price - a.price
			case "recent":
				return b.createdAt.toMillis() - a.createdAt.toMillis()
			case "popular":
				return (b.views || 0) - (a.views || 0)
			default:
				return b.createdAt.toMillis() - a.createdAt.toMillis()
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
		} catch (error: unknown) {
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
			<div className="min-h-screen bg-gray-50 dark:bg-gray-50 flex items-center justify-center transition-colors">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-600">Loading Marketplace...</p>
				</div>
			</div>
		)
	}

	// Error boundary fallback UI
	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-50 flex items-center justify-center p-4 transition-colors">
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
		<div className="min-h-screen bg-gray-50 dark:bg-gray-50 transition-colors">
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
				{/* Desktop Sidebar */}
				{!isMobile && (
					<MarketplaceBottomNav
						selectedCategory={selectedCategory}
						onCategoryChange={setSelectedCategory}
						onCreateListing={handleCreateListing}
						selectedLocation={selectedLocation}
						onLocationChange={setSelectedLocation}
						user={user}
						isMobile={isMobile}
					/>
				)}

				{/* Main content */}
				<div className="flex-1 p-4 md:p-6">
					{/* Main content - full width now */}
		<div className="p-4 md:p-6 pb-20">{/* Added bottom padding for bottom nav */}
					{/* Mobile Filter Toggle */}
					{isMobile && (
						<div className="mb-4 flex items-center justify-between">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSidebarOpen(true)}
								className="border-gray-300 dark:border-gray-300"
							>
								<Menu className="h-4 w-4 mr-2" />
								Filters
							</Button>
							<div className="text-sm text-gray-500 dark:text-gray-500">
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
									className="pl-10 border-gray-300 dark:border-gray-300"
								/>
							</div>
						</div>
					)}

					{/* Results header */}
					<div className="mb-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-900 mb-2">
									{selectedCategory === "All" ? "All listings" : selectedCategory}
								</h2>
								<p className="text-gray-600 dark:text-gray-600 text-sm md:text-base">
									{productsLoading ? (
										"Loading products..."
									) : (
										<>
											{sortedProducts.length} listing{sortedProducts.length !== 1 ? 's' : ''} found
											{selectedLocation !== "All Locations" && (
												<Badge variant="secondary" className="ml-2 bg-blue-100 dark:bg-blue-100 text-blue-800 dark:text-blue-800">
													📍 {selectedLocation}
												</Badge>
											)}
											{searchTerm && (
												<Badge variant="secondary" className="ml-2 bg-blue-100 dark:bg-blue-100 text-blue-800 dark:text-blue-800">
													🔍 &quot;{searchTerm}&quot;
												</Badge>
											)}
										</>
									)}
								</p>
							</div>
							
							{/* Page indicator */}
							{totalPages > 1 && !isMobile && (
								<div className="text-sm text-gray-500 dark:text-gray-500">
									Page {currentPage} of {totalPages}
								</div>
							)}
						</div>
					</div>

					{/* Products grid */}
					{productsLoading ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
							{Array.from({ length: 10 }).map((_, index) => (
								<div key={index} className="bg-white dark:bg-white rounded-lg p-4 animate-pulse border border-gray-200 dark:border-gray-200">
									<div className="aspect-square bg-gray-200 dark:bg-gray-200 rounded-lg mb-3"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-200 rounded mb-2"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-200 rounded mb-2 w-3/4"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-200 rounded w-1/2"></div>
								</div>
							))}
						</div>
					) : paginatedProducts.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
							{paginatedProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									onClick={() => handleProductClick(product.id)}
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
							<h3 className="text-lg font-medium text-gray-900 dark:text-gray-900 mb-2">No listings found</h3>
							<p className="text-gray-500 dark:text-gray-500">
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

			{/* Mobile Bottom Navigation */}
			{isMobile && (
				<MarketplaceBottomNav
					selectedCategory={selectedCategory}
					categories={categories}
					onCategoryChange={setSelectedCategory}
					onCreateListing={handleCreateListing}
					selectedLocation={selectedLocation}
					onLocationChange={setSelectedLocation}
					user={user}
					isMobile={isMobile}
				/>
			)}
			{/* Bottom Navigation */}
			<MarketplaceSidebar
				selectedCategory={selectedCategory}
				categories={categories}
				onCategoryChange={setSelectedCategory}
				onCreateListing={handleCreateListing}
				selectedLocation={selectedLocation}
				onLocationChange={setSelectedLocation}
			/>

			{/* Price range filter sheet */}
			<Sheet open={showPriceFilter} onOpenChange={setShowPriceFilter}>
				<SheetContent className="bg-white dark:bg-white">
					<SheetHeader>
						<SheetTitle className="text-gray-900 dark:text-gray-900">Filter by Price</SheetTitle>
					</SheetHeader>
					<div className="p-4 space-y-6">
						<div>
							<Label htmlFor="price-range" className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-4">
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
		</div>
	)
}