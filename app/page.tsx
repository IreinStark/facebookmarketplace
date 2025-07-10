"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Search, MapPin, MessageCircle, Heart, User, Plus, Moon, Sun, MessageSquare, Menu, Send, LogOut, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@components/ui/alert"
import Link from "next/link"
import { useTheme } from "next-themes"

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

	// Enhanced auth state management
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (firebaseUser) {
					setUser(firebaseUser)
					setIsLoggedIn(true)
					setUserProfile({ displayName: firebaseUser.displayName || firebaseUser.email })
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
											onClick={() => {/* handleProductMessage(product) */}}
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
			{/* ...rest of your Sheets (Messages, Mobile Menu, etc.) */}
		</div>
	)
}