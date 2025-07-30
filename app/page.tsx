"use client"

import React, { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"

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

// --- Import REAL Firebase product functions (from firebase-utils) ---
import { subscribeToProducts as subscribeToRealProducts, deleteProduct, type Product } from "../lib/firebase-utils"

// --- Import MOCK product functions (from a new mock-data file) ---
import { subscribeMockProducts } from "../lib/mock-data-utils" // We'll create this file

import { getUserProfile, type UserProfile } from "../lib/user-utils"

// Import new components
import { MarketplaceNav } from "../components/marketplace-nav"
import { MarketplaceSidebar } from "../components/marketplace-sidebar"
import { ProductCard } from "../components/product-card" // Fixed import path

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
	// --- CONFIGURATION: Set this to true to use mock products during development ---
	const useMockProducts = true; // Set to `false` when you want to use real Firebase data for products
	
	const router = useRouter()
	
	// Filter and UI state
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [selectedLocation, setSelectedLocation] = useState("All Locations")
	const [searchTerm, setSearchTerm] = useState("")
	const [sortBy, setSortBy] = useState("newest")
	const [showPriceFilter, setShowPriceFilter] = useState(false)
	const [priceRange, setPriceRange] = useState([0, 2000])
	
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
	const [products, setProducts] = useState<Product[]>([])
	const [productsLoading, setProductsLoading] = useState(true)

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

					// If favorites are stored in user profile, set them here:
					// setFavorites(profile?.favorites || []);

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

	// Subscribe to products from Firebase OR use mock data
	useEffect(() => {
		setProductsLoading(true)

		let unsubscribe: () => void;

		if (useMockProducts) {
			// Use mock data for products
			console.log('Using mock products...');
			unsubscribe = subscribeMockProducts((mockProducts) => {
				console.log('Received mock products:', mockProducts.length, 'products');
				setProducts(mockProducts as Product[]);
				setProductsLoading(false);
			});
		} else {
			// Use real Firebase data for products
			console.log('Using real Firebase products...');
			unsubscribe = subscribeToRealProducts((firebaseProducts) => {
				console.log('Received real products from Firebase:', firebaseProducts.length, 'products');
				setProducts(firebaseProducts);
				setProductsLoading(false);
			});
		}

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, [useMockProducts]);

	// Filter and sort products based on user selections
	const filteredProducts = products.filter((product) => {
		const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
		const matchesLocation = selectedLocation === "All Locations" || product.location === selectedLocation
		const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
		router.push(`/product/${productId}`)
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
		router.push(`/messages?product=${productId}`)
	}

	const handleDeleteProduct = async (productId: string) => {
		if (!user) {
			console.error('User not authenticated')
			return
		}
		
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
			/>

			<div className="flex">
				{/* Sidebar */}
				<MarketplaceSidebar
					selectedCategory={selectedCategory}
					categories={categories}
					onCategoryChange={setSelectedCategory}
					onCreateListing={handleCreateListing}
				/>

				{/* Main content */}
				<div className="flex-1 p-6">
					{/* Results header */}
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
							{selectedCategory === "All" ? "All listings" : selectedCategory}
						</h2>
						<p className="text-gray-600 dark:text-gray-400">
							{productsLoading ? (
								"Loading products..."
							) : (
								<>
									{sortedProducts.length} listing{sortedProducts.length !== 1 ? 's' : ''} found
									{selectedLocation !== "All Locations" && ` in ${selectedLocation}`}
									{searchTerm && ` matching "${searchTerm}"`}
									{totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
								</>
							)}
						</p>
					</div>

					{/* Products grid */}
					{productsLoading ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{Array.from({ length: 10 }).map((_, index) => (
								<div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
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
								<div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
									<span className="text-4xl">📦</span>
								</div>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No listings found</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								{searchTerm || selectedLocation !== "All Locations" || selectedCategory !== "All"
									? "Try adjusting your filters or search terms"
									: "Be the first to list an item in this marketplace!"
								}
							</p>
							{filteredProducts.length !== products.length && (
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Total products: {products.length}, Filtered: {filteredProducts.length}
								</p>
							)}
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
									showDeleteButton={user?.uid === product.sellerId}
								/>
							))}
						</div>
					)}

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
				</div>
			</div>

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