"use client"

import React, { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"

import { auth } from "@/firebase"
import { Alert, AlertDescription } from "@components/ui/alert"
import { useSocket } from "../hooks/use-socket"
import { subscribeToProducts, deleteProduct, type Product } from "../lib/firebase-utils"
import { getUserProfile, type UserProfile } from "../lib/user-utils"

// Import new components
import { MarketplaceNav } from "../components/marketplace-nav"
import { MarketplaceSidebar } from "../components/marketplace-sidebar"
import { ProductCard } from "../components/product-card"

// Categories for filtering (matching the sell page categories)
const categories = ["All", "Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden", "Automotive", "Other"]

export default function MarketplacePage() {
	const router = useRouter()
	
	// Filter and UI state
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [selectedLocation, setSelectedLocation] = useState("All Locations")
	const [searchTerm, setSearchTerm] = useState("")
	const [sortBy, setSortBy] = useState("newest")
	
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
		const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
		                     product.description.toLowerCase().includes(searchTerm.toLowerCase())

		return matchesCategory && matchesLocation && matchesSearch
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
		window.location.href = `/product/${productId}`

		router.push(`/products/${productId}`)
	}

	const handleFavoriteClick = (productId: string) => {
		console.log('Favorite clicked:', productId)
		// Toggle favorite status - implement with Firebase later
		setFavorites(prev => 
			prev.includes(productId) 
				? prev.filter(id => id !== productId)
				: [...prev, productId]
		)
	}

	const handleMessageClick = (productId: string) => {
		console.log('Message clicked:', productId)
		// Navigate to chat or open chat modal
		router.push(`/messages?product=${productId}`)
	}

	const handleDeleteClick = async (productId: string) => {
		try {
			await deleteProduct(productId)
			console.log('Product deleted successfully')
			// Products will be updated automatically via the subscription
		} catch (error) {
			console.error('Failed to delete product:', error)
			setError('Failed to delete product. Please try again.')
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

	const handleDeleteProduct = async (productId: string) => {
		if (!user) {
			console.error('User not authenticated')
			return
		}
		
		try {
			await deleteProduct(productId, user.uid)
			console.log('Product deleted successfully')
			// The real-time subscription will automatically update the UI
		} catch (error: any) {
			console.error('Failed to delete product:', error.message)
			setError('Failed to delete listing: ' + error.message)
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
							{sortedProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									currentUserId={user?.uid}
									onProductClick={handleProductClick}
									onFavoriteClick={handleFavoriteClick}
									onMessageClick={handleMessageClick}
									onDeleteClick={handleDeleteProduct}
									onDeleteClick={handleDeleteClick}
									onUserClick={handleUserClick}
									isFavorited={favorites.includes(product.id)}
									currentUserId={user?.uid}
									showDeleteButton={true}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}