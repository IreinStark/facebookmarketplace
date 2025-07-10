"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase"
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
import { Search, MapPin, MessageCircle, Heart, User, Plus, Moon, Sun, MessageSquare, Menu, Send, LogOut, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

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

// Mock data (replace with real data/service in production)
const products = [
	{
		id: 1,
		title: "iPhone 14 Pro Max",
		price: 899,
		location: "Downtown",
		image: "/placeholder.svg?height=200&width=200",
		category: "Electronics",
		seller: "John Doe",
		sellerId: "john-doe",
		isNegotiable: true,
		underNegotiation: false,
		postedDate: "2 days ago",
	},
	{
		id: 2,
		title: "Vintage Leather Sofa",
		price: 450,
		location: "Suburbs",
		image: "/placeholder.svg?height=200&width=200",
		category: "Furniture",
		seller: "Sarah Wilson",
		sellerId: "sarah-wilson",
		isNegotiable: true,
		underNegotiation: true,
		postedDate: "1 week ago",
	},
	{
		id: 3,
		title: "Mountain Bike",
		price: 320,
		location: "City Center",
		image: "/placeholder.svg?height=200&width=200",
		category: "Sports",
		seller: "Mike Johnson",
		sellerId: "mike-johnson",
		isNegotiable: false,
		underNegotiation: false,
		postedDate: "3 days ago",
	},
	{
		id: 4,
		title: "Gaming Laptop",
		price: 1200,
		location: "Tech District",
		image: "/placeholder.svg?height=200&width=200",
		category: "Electronics",
		seller: "Alex Chen",
		sellerId: "alex-chen",
		isNegotiable: true,
		underNegotiation: true,
		postedDate: "5 days ago",
	},
	{
		id: 5,
		title: "Dining Table Set",
		price: 280,
		location: "Residential Area",
		image: "/placeholder.svg?height=200&width=200",
		category: "Furniture",
		seller: "Emma Davis",
		sellerId: "emma-davis",
		isNegotiable: true,
		underNegotiation: false,
		postedDate: "1 day ago",
	},
	{
		id: 6,
		title: "Tennis Racket",
		price: 85,
		location: "Sports Complex",
		image: "/placeholder.svg?height=200&width=200",
		category: "Sports",
		seller: "David Brown",
		sellerId: "david-brown",
		isNegotiable: false,
		underNegotiation: false,
		postedDate: "4 days ago",
	},
]
const categories = ["All", "Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden"]

export default function MarketplacePage() {
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [searchTerm, setSearchTerm] = useState("")
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
	const [user, setUser] = useState<any>(null)
	const [userProfile, setUserProfile] = useState<any>(null)
	const [isMessagesOpen, setIsMessagesOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
	const [conversations, setConversations] = useState<any[]>([])
	const [newMessage, setNewMessage] = useState("")
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [favorites, setFavorites] = useState<number[]>([])
	const { theme, setTheme } = useTheme()

	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	const [submitError, setSubmitError] = useState("");

	// Enhanced auth state management
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (firebaseUser) {
					const name =
						firebaseUser.displayName && firebaseUser.displayName.trim() !== ""
							? firebaseUser.displayName
							: firebaseUser.email?.split("@")[0]; // fallback: part before @ of email
					setUser(firebaseUser)
					setIsLoggedIn(true)
					setUserProfile({ displayName: name })
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

	const handleToggleFavorite = (productId: number) => {
		if (!user) return
		setFavorites((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId]
		)
	}

	const handleProductMessage = (product: (typeof products)[0]) => {
		let conversation = conversations.find((conv) => conv.id === product.sellerId)

		if (!conversation) {
			conversation = {
				id: product.sellerId,
				name: product.seller,
				lastMessage: "",
				time: "now",
				unread: false,
				productTitle: product.title,
				productPrice: product.price,
				messages: [],
			}
			setConversations((prev) => [conversation, ...prev])
		}

		setSelectedConversation(product.sellerId)
		setIsMessagesOpen(true)
	}

	const filteredProducts = products.filter((product) => {
		const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
		const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
		return matchesCategory && matchesSearch
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

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Add your validation and submission logic here
		if (!title || !price) {
			setSubmitError("Title and price are required.");
			return;
		}
		setSubmitError("");
		// Submit the listing (e.g., send to Firestore)
		// Reset form if needed
		setTitle("");
		setPrice("");
		setDescription("");
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
					{/* Left side - Logo and Search */}
					<div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
						<h1
							className="text-base sm:text-lg lg:text-xl font-bold text-white hidden sm:block whitespace-nowrap cursor-pointer hover:text-gray-200 transition-colors"
							onClick={() => window.location.reload()}
						>
							Local Marketplace
						</h1>
						<h1
							className="text-lg font-bold text-white sm:hidden cursor-pointer hover:text-gray-200 transition-colors"
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
                            <span className="text-sm text-white mr-2 hidden sm:block">
                                {userProfile.displayName}
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
			<div className="container px-2 sm:px-4 py-4">
				<div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6 text-center">
					<h1 className="text-2xl sm:text-3xl font-bold mb-2">Marketplace</h1>
					<p className="mb-4">Welcome to the Marketplace clone.</p>
					<div className="space-x-4">
						<Link href="/sell" className="text-blue-600 underline font-medium">
							Post a Listing
						</Link>
						<Link href="#products" className="text-blue-600 underline font-medium">
							View Listings
						</Link>
					</div>
				</div>
			</div>

			<div id="products" className="container px-2 sm:px-4 py-4 sm:py-6">
				{/* Categories and Filters */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
					<div className="flex items-center space-x-2 sm:space-x-4">
						<span className="text-sm font-medium whitespace-nowrap">
							Welcome back, {userProfile?.displayName || 'User'}!
						</span>
					</div>
					<div className="flex items-center space-x-2">
						<label htmlFor="category-select" className="text-sm font-medium whitespace-nowrap">
							Category:
						</label>
						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className="w-36 sm:w-40 lg:w-48">
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
					</div>
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
					{filteredProducts.map((product) => (
						<Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
							<div className="relative">
								<img
									src={product.image || "/placeholder.svg"}
									alt={`Image of ${product.title}`}
									className="w-full h-32 sm:h-40 lg:h-48 object-cover"
								/>
								{product.underNegotiation && (
									<Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-xs">
										Under Negotiation
									</Badge>
								)}
								{product.isNegotiable && !product.underNegotiation && (
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
													{product.seller
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<span className="text-xs sm:text-sm text-muted-foreground truncate">{product.seller}</span>
										</div>
										<span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{product.postedDate}</span>
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
												aria-label={favorites.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
											/>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{filteredProducts.length === 0 && (
					<div className="text-center py-12">
						<p className="text-muted-foreground">No products found matching your criteria.</p>
					</div>
				)}
			</div>

			{/* Sell Page - Post a Listing */}
			<div className="container max-w-md mx-auto py-6">
				<h1 className="text-2xl font-bold mb-4">Post a Listing</h1>
				{submitError && <p className="text-red-600 mb-4">{submitError}</p>}
				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						type="text"
						placeholder="Product Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
					<Input
						type="number"
						placeholder="Price"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						required
					/>
					<Textarea
						placeholder="Description (optional)"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={4}
					/>
					<Button type="submit" disabled={loading}>
						{loading ? "Posting..." : "Post Listing"}
					</Button>
				</form>
			</div>

			{/* ...rest of your Sheets (Messages, Mobile Menu, etc.) */}
		</div>
	)
}