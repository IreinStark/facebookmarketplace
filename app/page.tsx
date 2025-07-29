"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/firebase"
import { Button } from "@components/ui/button"
import { Card, CardContent } from "@components/ui/card"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@components/ui/sheet"
import { Slider } from "@components/ui/slider"
import { Label } from "@components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@components/ui/pagination"
import { Alert, AlertDescription } from "@components/ui/alert"
import { useTheme } from "next-themes"
import { useSocket } from "../hooks/use-socket"
import { subscribeToProducts, type Product } from "../lib/firebase-utils"
import { formatDistanceToNow } from "date-fns"
import { Timestamp } from "firebase/firestore"
import { getUserProfile, type UserProfile } from "../lib/user-utils"

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
	const [user, setUser] = useState<User | null>(null)
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
	const [error, setError] = useState<string | null>(null)

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

	useEffect(() => {
		setProductsLoading(true)

		// Subscribe to products updates
		const unsubscribe = subscribeToProducts((snapshot) => {
			const loadedProducts: Product[] = []
			snapshot.forEach((doc) => {
				const data = doc.data() as Product
				loadedProducts.push({ id: doc.id, ...data })
			})

			setProducts(loadedProducts)
			setProductsLoading(false)
		},
		 (error) => {
			console.error("Error fetching products: ", error)
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

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10

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
			<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
				<h1 className="text-3xl font-bold mb-4 md:mb-0">Marketplace</h1>
				<div className="flex flex-col md:flex-row md:items-center">
					<Button variant="outline" className="mr-4" onClick={() => setShowPriceFilter(!showPriceFilter)}>
						Filter by Price
					</Button>
					<Select value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto mb-4 md:mb-0">
						<SelectTrigger>
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
					<Select value={selectedLocation} onValueChange={setSelectedLocation} className="w-full md:w-auto mb-4 md:mb-0">
						<SelectTrigger>
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
								No products found matching your criteria.
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
								<div className="flex flex-col sm:flex-row sm:items-center">
									<div className="flex-shrink-0 mb-4 sm:mb-0">
										<Avatar>
											<AvatarFallback>
												{mockSellerNames[product.userId]?.[0] || "U"}
											</AvatarFallback>
										</Avatar>
									</div>
									<div className="flex-grow">
										<p className="text-sm text-gray-500">
											{product.location} &bull;{" "}
											{formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true })}
										</p>
										<h2 className="text-xl font-bold">
											${Number(product.price).toFixed(2)}
										</h2>
									</div>
								</div>
								<p className="mt-2 text-gray-700">
									{product.description}
								</p>
							</CardContent>
						</Card>
					))
				)}
			</div>

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
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
						))}
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

			{/* Price range filter sheet */}
			<Sheet open={showPriceFilter} onOpenChange={setShowPriceFilter}>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Filter by Price</SheetTitle>
					</SheetHeader>
					<div className="p-4">
						<Label htmlFor="price-range" className="block text-sm font-medium text-gray-700">
							Price range:
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
						<div className="flex justify-between text-xs text-gray-500 mt-1">
							<span>${priceRange[0]}</span>
							<span>${priceRange[1]}</span>
						</div>
					</div>
					<div className="flex justify-end p-4">
						<Button variant="outline" onClick={() => setShowPriceFilter(false)} className="mr-2">
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