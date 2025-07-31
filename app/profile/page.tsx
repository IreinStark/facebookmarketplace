"use client"

import { useState, useEffect } from "react"
import { Button } from "@components/ui/button"
import { Card, CardContent } from "@components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { Badge } from "@components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Switch } from "@components/ui/switch"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Separator } from "@components/ui/separator"
import {
  ArrowLeft,
  MapPin,
  Star,
  MessageCircle,
  Edit,
  Package,
  Heart,
  Moon,
  Sun,
  Bell,
  Shield,
  LogOut,
  Pencil,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@components/ui/dialog";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { updatePassword } from "firebase/auth";
import { getUserProfile, updateUserProfile, getUserDisplayName, type UserProfile } from "../../lib/user-utils";

// Mock products data (same as in main page)
const allProducts = [
  {
    id: 1,
    title: "iPhone 14 Pro Max",
    price: 899,
    location: "Lefkosa",
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
    location: "Girne",
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
    location: "Lefkosa",
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
    location: "Famagusta",
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
    location: "Lefkosa",
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
    location: "Girne",
    image: "/placeholder.svg?height=200&width=200",
    category: "Sports",
    seller: "David Brown",
    sellerId: "david-brown",
    isNegotiable: false,
    underNegotiation: false,
    postedDate: "4 days ago",
  },
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [notifications, setNotifications] = useState({
    messages: true,
    newListings: false,
    priceDrops: true,
    marketing: false,
  })
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Load user profile from Firestore
        const profile = await getUserProfile(firebaseUser);
        setUserProfile(profile);
        
        // Fetch user's listings
        const q = query(collection(db, "products"), where("userId", "==", firebaseUser.uid));
        const querySnapshot = await getDocs(q);
        setMyListings(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setUser(null);
        setUserProfile(null);
        router.push("/auth/login");
      }
      setLoading(false);
    });
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("favorites");
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return;
    
    setSaving(true);
    try {
      const updates: Partial<UserProfile> = {
        displayName: editDisplayName,
        username: editUsername,
        location: editLocation,
        bio: editBio
      };
      
      const success = await updateUserProfile(user.uid, updates);
      if (success) {
        // Update local state
        setUserProfile({...userProfile, ...updates});
        setShowEditModal(false);
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const openEditModal = () => {
    if (userProfile) {
      setEditDisplayName(userProfile.displayName);
      setEditUsername(userProfile.username || "");
      setEditLocation(userProfile.location || "");
      setEditBio(userProfile.bio || "");
      setShowEditModal(true);
    }
  }

  const removeFavorite = (productId: number) => {
    const updatedFavorites = favorites.filter((id) => id !== productId)
    setFavorites(updatedFavorites)
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, "products", listingId));
      setMyListings((prev) => prev.filter((item) => item.id !== listingId));
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  // Get favorite products from the main products list
  const favoriteItems = allProducts.filter((product) => favorites.includes(product.id))

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    setPasswordMsg("");
    try {
      if (auth.currentUser && newPassword) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordMsg("Password updated successfully.");
        setNewPassword("");
      }
    } catch (err: any) {
      setPasswordMsg(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 sm:h-16 items-center px-2 sm:px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="ml-2 sm:ml-4 text-lg sm:text-xl font-semibold">Profile</h1>
        </div>
      </header>

      <div className="container py-4 sm:py-6 px-2 sm:px-4">
        {/* Profile Header */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
                <AvatarImage src={userProfile?.avatar || "/placeholder.svg?height=80&width=80"} />
                <AvatarFallback className="text-lg">
                  {getUserDisplayName(user, userProfile)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold">{getUserDisplayName(user, userProfile)}</h2>
                      {userProfile?.verified && (
                        <span className="text-blue-500 text-lg" title="Verified user">
                          ✓
                        </span>
                      )}
                    </div>
                    {userProfile?.username && userProfile.username !== userProfile.displayName && (
                      <p className="text-muted-foreground text-sm">@{userProfile.username}</p>
                    )}
                    <p className="text-muted-foreground text-sm sm:text-base">{user?.email}</p>
                    {userProfile?.location && (
                      <div className="flex items-center justify-center sm:justify-start mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {userProfile.location}
                      </div>
                    )}
                    {userProfile?.bio && (
                      <p className="text-sm text-muted-foreground mt-2">{userProfile.bio}</p>
                    )}
                  </div>
                  <div className="flex flex-col xs:flex-row gap-2">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent" onClick={openEditModal}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="hidden xs:inline">Sign Out</span>
                      <span className="xs:hidden">Logout</span>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start space-x-4 mt-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium text-sm sm:text-base">4.8</span>
                    <span className="text-muted-foreground ml-1 text-xs sm:text-sm">(24 reviews)</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Verified Seller
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="listings" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="listings" className="text-xs sm:text-sm py-2">
              My Listings
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs sm:text-sm py-2">
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm py-2">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold">My Listings ({myListings.length})</h3>
              <Link href="/sell">
                <Button size="sm" className="w-full xs:w-auto">
                  <Package className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {myListings.map((item) => (
                <Card key={item.id}>
                  <div className="relative group">
                    <Link href={`/products/${item.id}`} className="block">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-32 sm:h-40 object-cover rounded-t-lg group-hover:opacity-80 transition"
                      />
                    </Link>
                    <Badge
                      className={`absolute top-2 right-2 text-xs ${item.status === "sold" ? "bg-green-500" : "bg-blue-500"}`}
                    >
                      {item.status === "sold" ? "Sold" : "Active"}
                    </Badge>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 left-10 h-7 w-7 p-0 opacity-80 hover:opacity-100"
                      title="Edit Listing"
                      asChild
                    >
                      <Link href={`/products/${item.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2 h-7 w-7 p-0 opacity-80 hover:opacity-100"
                      title="Delete Listing"
                      onClick={() => handleDeleteListing(item.id)}
                    >
                      ×
                    </Button>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <Link href={`/products/${item.id}`} className="block hover:underline">
                      <h4 className="font-semibold text-sm sm:text-base">{item.title}</h4>
                    </Link>
                    <p className="text-base sm:text-lg font-bold text-green-600">${item.price}</p>
                    <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-2">
                      <span>{item.views || 0} views</span>
                      <span>{item.messages || 0} messages</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Favorite Items ({favorites.length})</h3>

            {favoriteItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {favoriteItems.map((item) => (
                  <Card key={item.id}>
                    <div className="relative">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-32 sm:h-40 object-cover rounded-t-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => removeFavorite(item.id)}
                      >
                        ×
                      </Button>
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <h4 className="font-semibold text-sm sm:text-base">{item.title}</h4>
                      <p className="text-base sm:text-lg font-bold text-green-600">${item.price}</p>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>{item.location}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">by {item.seller}</p>
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" className="flex-1 text-xs">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 bg-transparent"
                          onClick={() => removeFavorite(item.id)}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No favorite items yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start adding items to your favorites by clicking the heart icon
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Reviews (24)</h3>

            <div className="space-y-4">
              {[1, 2, 3].map((review) => (
                <Card key={review}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback className="text-xs sm:text-sm">U{review}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm sm:text-base">User {review}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Great seller! Item was exactly as described and shipping was fast.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">2 weeks ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-semibold">Settings</h3>

            {/* Appearance */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  {theme === "dark" ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />}
                  <h4 className="text-base sm:text-lg font-semibold">Appearance</h4>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="text-sm sm:text-base">
                      Dark Mode
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? "dark" : "light")
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <Bell className="h-5 w-5 mr-2" />
                  <h4 className="text-base sm:text-lg font-semibold">Notifications</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="messages" className="text-sm sm:text-base">
                        New Messages
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Get notified when someone messages you</p>
                    </div>
                    <Switch
                      id="messages"
                      checked={notifications.messages}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-listings" className="text-sm sm:text-base">
                        New Listings
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Get notified about new items in your area
                      </p>
                    </div>
                    <Switch
                      id="new-listings"
                      checked={notifications.newListings}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, newListings: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="price-drops" className="text-sm sm:text-base">
                        Price Drops
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Get notified when saved items drop in price
                      </p>
                    </div>
                    <Switch
                      id="price-drops"
                      checked={notifications.priceDrops}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, priceDrops: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing" className="text-sm sm:text-base">
                        Marketing
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Receive promotional emails and updates</p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <h4 className="text-base sm:text-lg font-semibold">Location</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location" className="text-sm sm:text-base">
                      Your Location
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      This helps us show you relevant listings nearby
                    </p>
                    <Input
                      id="location"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Enter your location"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <Button variant="outline" className="w-full text-sm bg-transparent">
                    Use Current Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 mr-2" />
                  <h4 className="text-base sm:text-lg font-semibold">Privacy & Security</h4>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <Button variant="outline" className="w-full justify-start text-sm bg-transparent" onClick={() => setShowPasswordModal(true)}>
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm bg-transparent" onClick={() => setShowPrivacyModal(true)}>
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm bg-transparent" onClick={() => setShowBlockedModal(true)}>
                    Blocked Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
                    Download My Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
                    Help & Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
                    Terms of Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
                    Privacy Policy
                  </Button>
                  <Separator />
                  <Button variant="destructive" className="w-full justify-start text-sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editDisplayName">Display Name</Label>
              <Input 
                id="editDisplayName" 
                value={editDisplayName} 
                onChange={e => setEditDisplayName(e.target.value)}
                placeholder="Your display name" 
              />
            </div>
            <div>
              <Label htmlFor="editUsername">Username (optional)</Label>
              <Input 
                id="editUsername" 
                value={editUsername} 
                onChange={e => setEditUsername(e.target.value)}
                placeholder="@username" 
              />
            </div>
            <div>
              <Label htmlFor="editLocation">Location (optional)</Label>
              <Input 
                id="editLocation" 
                value={editLocation} 
                onChange={e => setEditLocation(e.target.value)}
                placeholder="City, Country" 
              />
            </div>
            <div>
              <Label htmlFor="editBio">Bio (optional)</Label>
              <Input 
                id="editBio" 
                value={editBio} 
                onChange={e => setEditBio(e.target.value)}
                placeholder="Tell others about yourself" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            {passwordMsg && <div className="text-sm text-center" style={{ color: passwordMsg.includes('success') ? 'green' : 'red' }}>{passwordMsg}</div>}
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={passwordLoading || !newPassword}>
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Privacy Settings Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">Privacy settings coming soon.</div>
        </DialogContent>
      </Dialog>
      {/* Blocked Users Modal */}
      <Dialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blocked Users</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">Blocked users management coming soon.</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
