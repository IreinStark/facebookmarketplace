// lib/mock-data-utils.ts
import { Timestamp } from "firebase/firestore"

// Enhanced user profile interface
export interface UserProfile {
  uid: string
  displayName: string
  email: string
  location: string
  joinedAt: Date
  avatar?: string
  rating?: number
  totalSales?: number
}

// Enhanced product interface combining both approaches
export interface MockProduct {
  id: string
  title: string
  description: string
  price: number
  category: string
  location: string
  images: string[]
  sellerId: string
  seller: string // Display name for quick access
  sellerProfile: UserProfile // Full profile object
  condition: string // From File 1
  tags: string[] // From File 1
  createdAt: Timestamp // From File 2
  updatedAt: Timestamp // From File 2
  status: 'active' | 'sold' | 'inactive' // From File 2
}

// Enhanced mock user profiles with additional fields
export const mockUserProfiles: UserProfile[] = [
  {
    uid: "user1",
    displayName: "Ahmed Hassan",
    email: "ahmed@example.com",
    location: "Lefkosa",
    joinedAt: new Date("2024-01-15"),
    avatar: "https://picsum.photos/100/100?random=10",
    rating: 4.8,
    totalSales: 23
  },
  {
    uid: "user2",
    displayName: "Maria Georgiou",
    email: "maria@example.com",
    location: "Girne",
    joinedAt: new Date("2024-02-20"),
    avatar: "https://picsum.photos/100/100?random=11",
    rating: 4.9,
    totalSales: 31
  },
  {
    uid: "user3",
    displayName: "John Smith",
    email: "john@example.com",
    location: "Famagusta",
    joinedAt: new Date("2024-03-10"),
    avatar: "https://picsum.photos/100/100?random=12",
    rating: 4.6,
    totalSales: 18
  },
  {
    uid: "user4",
    displayName: "Ayşe Özkan",
    email: "ayse@example.com",
    location: "Iskele",
    joinedAt: new Date("2024-01-25"),
    avatar: "https://picsum.photos/100/100?random=13",
    rating: 4.7,
    totalSales: 27
  },
  {
    uid: "user5",
    displayName: "Chris Wilson",
    email: "chris@example.com",
    location: "Guzelyurt",
    joinedAt: new Date("2024-02-05"),
    avatar: "https://picsum.photos/100/100?random=14",
    rating: 4.5,
    totalSales: 15
  },
  {
    uid: "user6",
    displayName: "Elena Popov",
    email: "elena@example.com",
    location: "Lapta",
    joinedAt: new Date("2024-03-20"),
    avatar: "https://picsum.photos/100/100?random=15",
    rating: 4.9,
    totalSales: 42
  },
  {
    uid: "user7",
    displayName: "Mehmet Yılmaz",
    email: "mehmet@example.com",
    location: "Alsancak",
    joinedAt: new Date("2024-01-08"),
    avatar: "https://picsum.photos/100/100?random=16",
    rating: 4.4,
    totalSales: 12
  }
]

// Categories and locations for consistency
export const categories = [
  "All", "Electronics", "Furniture", "Sports", "Clothing", 
  "Books", "Home & Garden", "Automotive", "Other"
]

export const locations = [
  "Lefkosa", "Girne", "Famagusta", "Iskele", "Guzelyurt", 
  "Lapta", "Alsancak", "Catalkoy", "Esentepe", "Bogaz"
]

export const conditions = ["New", "Like New", "Good", "Fair", "Poor"]

// Enhanced mock products combining best features from both files
export const mockProducts: MockProduct[] = [
  {
    id: "prod1",
    title: "iPhone 14 Pro Max - 256GB",
    description: "Excellent condition iPhone 14 Pro Max, 256GB, Space Black. Includes original box, charger, and protective case. No scratches or dents.",
    price: 1200,
    category: "Electronics",
    location: "Lefkosa",
    images: ["https://picsum.photos/400/400?random=1", "https://picsum.photos/400/400?random=2"],
    sellerId: "user1",
    seller: "Ahmed Hassan",
    sellerProfile: mockUserProfiles[0],
    condition: "Like New",
    tags: ["phone", "apple", "iphone", "smartphone"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod2",
    title: "Modern Sofa Set - 3 Piece",
    description: "Beautiful 3-piece modern sofa set in gray fabric. Perfect for living room. Comfortable and stylish, seats up to 6 people.",
    price: 800,
    category: "Furniture",
    location: "Girne",
    images: ["https://picsum.photos/400/400?random=3"],
    sellerId: "user2",
    seller: "Maria Georgiou",
    sellerProfile: mockUserProfiles[1],
    condition: "Good",
    tags: ["sofa", "furniture", "living room", "gray"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod3",
    title: "Trek Mountain Bike X-Caliber",
    description: "Well-maintained Trek mountain bike, perfect for trails and city riding. Recently serviced with new tires and brake pads. 21-speed aluminum frame.",
    price: 450,
    category: "Sports",
    location: "Famagusta",
    images: ["https://picsum.photos/400/400?random=4", "https://picsum.photos/400/400?random=5"],
    sellerId: "user3",
    seller: "John Smith",
    sellerProfile: mockUserProfiles[2],
    condition: "Good",
    tags: ["bike", "mountain", "sports", "trek", "cycling"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod4",
    title: "Vintage Leather Jacket - Size M",
    description: "Genuine leather jacket, vintage style. Size M. Perfect for winter. High-quality leather with classic design.",
    price: 120,
    category: "Clothing",
    location: "Lefkosa",
    images: ["https://picsum.photos/400/400?random=6"],
    sellerId: "user4",
    seller: "Ayşe Özkan",
    sellerProfile: mockUserProfiles[3],
    condition: "Good",
    tags: ["jacket", "leather", "vintage", "winter", "fashion"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod5",
    title: "Programming Books Collection",
    description: "Collection of 10 programming books including JavaScript, Python, React, and Node.js. Great for students and developers.",
    price: 80,
    category: "Books",
    location: "Girne",
    images: ["https://picsum.photos/400/400?random=7"],
    sellerId: "user5",
    seller: "Chris Wilson",
    sellerProfile: mockUserProfiles[4],
    condition: "Good",
    tags: ["books", "programming", "education", "javascript", "python"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod6",
    title: "Gaming Setup - Complete RGB",
    description: "Complete gaming setup with RGB mechanical keyboard, gaming mouse, headset, and large mousepad. Perfect for competitive gaming.",
    price: 300,
    category: "Electronics",
    location: "Iskele",
    images: ["https://picsum.photos/400/400?random=8", "https://picsum.photos/400/400?random=9"],
    sellerId: "user6",
    seller: "Elena Popov",
    sellerProfile: mockUserProfiles[5],
    condition: "Like New",
    tags: ["gaming", "keyboard", "mouse", "rgb", "setup"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod7",
    title: "Samsung 55\" 4K Smart TV",
    description: "Excellent condition Samsung Smart TV with 4K resolution and HDR support. Perfect for streaming and gaming. Includes remote and all cables.",
    price: 520,
    category: "Electronics",
    location: "Guzelyurt",
    images: ["https://picsum.photos/400/400?random=10"],
    sellerId: "user1",
    seller: "Ahmed Hassan",
    sellerProfile: mockUserProfiles[0],
    condition: "Like New",
    tags: ["tv", "samsung", "4k", "smart tv", "entertainment"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod8",
    title: "Garden Tools Set - Professional",
    description: "Complete set of professional garden tools including shovel, rake, pruners, watering can, and hand tools. Perfect for home gardening.",
    price: 60,
    category: "Home & Garden",
    location: "Guzelyurt",
    images: ["https://picsum.photos/400/400?random=11"],
    sellerId: "user7",
    seller: "Mehmet Yılmaz",
    sellerProfile: mockUserProfiles[6],
    condition: "Good",
    tags: ["garden", "tools", "outdoor", "gardening", "professional"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod9",
    title: "MacBook Air M1 - 256GB",
    description: "Apple MacBook Air with M1 chip, 8GB RAM, 256GB storage. Excellent performance for work and creative tasks. Includes charger and box.",
    price: 750,
    category: "Electronics",
    location: "Lapta",
    images: ["https://picsum.photos/400/400?random=12", "https://picsum.photos/400/400?random=13"],
    sellerId: "user2",
    seller: "Maria Georgiou",
    sellerProfile: mockUserProfiles[1],
    condition: "Good",
    tags: ["laptop", "apple", "macbook", "m1", "computer"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod10",
    title: "Car Tires - Set of 4 (205/55R16)",
    description: "Brand new set of 4 summer tires, 205/55R16. Never used, still have manufacturer stickers. Perfect for compact cars.",
    price: 400,
    category: "Automotive",
    location: "Alsancak",
    images: ["https://picsum.photos/400/400?random=14"],
    sellerId: "user4",
    seller: "Ayşe Özkan",
    sellerProfile: mockUserProfiles[3],
    condition: "New",
    tags: ["tires", "car", "automotive", "summer", "new"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod11",
    title: "Professional Camera - Canon EOS R5",
    description: "Canon EOS R5 with 24-70mm lens and accessories. Perfect for professional photography and videography. Includes battery grip and extra batteries.",
    price: 2200,
    category: "Electronics",
    location: "Catalkoy",
    images: ["https://picsum.photos/400/400?random=15", "https://picsum.photos/400/400?random=16"],
    sellerId: "user3",
    seller: "John Smith",
    sellerProfile: mockUserProfiles[2],
    condition: "Like New",
    tags: ["camera", "photography", "canon", "professional", "lens"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
    status: "active"
  },
  {
    id: "prod12",
    title: "Electric Scooter - Xiaomi Pro 2",
    description: "Xiaomi electric scooter in great condition. Range up to 25km, foldable design. Perfect for city commuting.",
    price: 350,
    category: "Sports",
    location: "Bogaz",
    images: ["https://picsum.photos/400/400?random=17"],
    sellerId: "user5",
    seller: "Chris Wilson",
    sellerProfile: mockUserProfiles[4],
    condition: "Good",
    tags: ["scooter", "electric", "transport", "xiaomi", "commute"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    status: "active"
  }
]

// Enhanced subscription function with better real-time simulation
export function subscribeMockProducts(callback: (products: MockProduct[]) => void): () => void {
  let currentProducts = [...mockProducts]
  
  // Initial data load with realistic delay
  setTimeout(() => {
    callback(currentProducts)
  }, 300)

  // Simulate realistic real-time updates
  const interval = setInterval(() => {
    const updateType = Math.random()
    
    if (updateType < 0.3) {
      // 30% chance: Add new product
      const newProduct = generateRandomProduct(currentProducts.length + 1)
      currentProducts = [newProduct, ...currentProducts]
      callback(currentProducts)
    } else if (updateType < 0.5 && currentProducts.length > 0) {
      // 20% chance: Mark random product as sold
      const randomIndex = Math.floor(Math.random() * currentProducts.length)
      currentProducts[randomIndex] = {
        ...currentProducts[randomIndex],
        status: 'sold' as const,
        updatedAt: Timestamp.fromDate(new Date())
      }
      callback(currentProducts)
    } else if (updateType < 0.7 && currentProducts.length > 0) {
      // 20% chance: Update price on random product
      const randomIndex = Math.floor(Math.random() * currentProducts.length)
      if (currentProducts[randomIndex].status === 'active') {
        const priceChange = Math.random() < 0.5 ? -0.1 : 0.1 // 10% price change
        currentProducts[randomIndex] = {
          ...currentProducts[randomIndex],
          price: Math.round(currentProducts[randomIndex].price * (1 + priceChange)),
          updatedAt: Timestamp.fromDate(new Date())
        }
        callback(currentProducts)
      }
    }
    // 30% chance: No update (realistic)
  }, 15000) // Update every 15 seconds

  // Return cleanup function
  return () => clearInterval(interval)
}

// Helper function to generate random products for real-time simulation
function generateRandomProduct(id: number): MockProduct {
  const randomCategory = categories.filter(c => c !== "All")[Math.floor(Math.random() * (categories.length - 1))]
  const randomLocation = locations[Math.floor(Math.random() * locations.length)]
  const randomSeller = mockUserProfiles[Math.floor(Math.random() * mockUserProfiles.length)]
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
  
  const productTitles = [
    "Wireless Headphones", "Office Desk", "Running Shoes", "Vintage Watch",
    "Coffee Machine", "Board Game", "Plant Pot", "Wall Mirror", "Cookbook",
    "Exercise Bike", "Tablet Stand", "Winter Coat", "Guitar", "Backpack"
  ]
  
  const randomTitle = productTitles[Math.floor(Math.random() * productTitles.length)]
  
  return {
    id: `prod${id}`,
    title: `${randomTitle} - ${randomCondition}`,
    description: `Recently added ${randomTitle.toLowerCase()} in ${randomCondition.toLowerCase()} condition. Added at ${new Date().toLocaleTimeString()}.`,
    price: Math.floor(Math.random() * 500) + 50,
    category: randomCategory,
    location: randomLocation,
    images: [`https://picsum.photos/400/400?random=${50 + id}`],
    sellerId: randomSeller.uid,
    seller: randomSeller.displayName,
    sellerProfile: randomSeller,
    condition: randomCondition,
    tags: [randomTitle.toLowerCase().split(' ')[0], randomCategory.toLowerCase(), randomCondition.toLowerCase()],
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    status: 'active'
  }
}

// Utility functions for filtering and searching
export function filterProductsByCategory(products: MockProduct[], category: string): MockProduct[] {
  if (category === "All") return products
  return products.filter(product => product.category === category)
}

export function filterProductsByLocation(products: MockProduct[], location: string): MockProduct[] {
  if (!location) return products
  return products.filter(product => product.location === location)
}

export function filterProductsByCondition(products: MockProduct[], condition: string): MockProduct[] {
  if (!condition) return products
  return products.filter(product => product.condition === condition)
}

export function searchProducts(products: MockProduct[], query: string): MockProduct[] {
  if (!query.trim()) return products
  
  const searchTerm = query.toLowerCase()
  return products.filter(product => 
    product.title.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    product.seller.toLowerCase().includes(searchTerm)
  )
}

export function sortProducts(products: MockProduct[], sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high'): MockProduct[] {
  const sorted = [...products]
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price)
    default:
      return sorted
  }
}