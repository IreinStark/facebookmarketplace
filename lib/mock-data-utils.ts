import { Timestamp } from "firebase/firestore"

// Mock user profiles for sellers
export const mockUserProfiles = [
  {
    uid: "user1",
    displayName: "Ahmed Hassan",
    email: "ahmed@example.com",
    location: "Lefkosa",
    joinedAt: new Date("2024-01-15")
  },
  {
    uid: "user2",
    displayName: "Maria Georgiou",
    email: "maria@example.com",
    location: "Girne",
    joinedAt: new Date("2024-02-20")
  },
  {
    uid: "user3",
    displayName: "John Smith",
    email: "john@example.com",
    location: "Famagusta",
    joinedAt: new Date("2024-03-10")
  },
  {
    uid: "user4",
    displayName: "Ayşe Özkan",
    email: "ayse@example.com",
    location: "Iskele",
    joinedAt: new Date("2024-01-25")
  },
  {
    uid: "user5",
    displayName: "Chris Wilson",
    email: "chris@example.com",
    location: "Guzelyurt",
    joinedAt: new Date("2024-02-05")
  }
]

// Mock product data that matches your Product interface
// Ensure this structure matches the 'Product' type from your 'firebase-utils'
export const mockProducts = [
  {
    id: "prod1",
    title: "iPhone 14 Pro - Like New",
    description: "Barely used iPhone 14 Pro in excellent condition. Comes with original box, charger, and protective case. No scratches or dents.",
    price: 850,
    category: "Electronics",
    location: "Lefkosa",
    sellerId: "user1",
    seller: "Ahmed Hassan",
    sellerProfile: mockUserProfiles[0],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/iphone1.jpg"]
  },
  {
    id: "prod2",
    title: "Vintage Wooden Dining Table",
    description: "Beautiful handcrafted wooden dining table that seats 6 people. Perfect for family gatherings. Minor wear consistent with age.",
    price: 320,
    category: "Furniture",
    location: "Girne",
    sellerId: "user2",
    seller: "Maria Georgiou",
    sellerProfile: mockUserProfiles[1],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/table1.jpg", "https://example.com/table2.jpg"]
  },
  {
    id: "prod3",
    title: "Mountain Bike - Trek X-Caliber",
    description: "Well-maintained Trek mountain bike, perfect for trails and city riding. Recently serviced with new tires and brake pads.",
    price: 450,
    category: "Sports",
    location: "Famagusta",
    sellerId: "user3",
    seller: "John Smith",
    sellerProfile: mockUserProfiles[2],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/bike1.jpg"]
  },
  {
    id: "prod4",
    title: "Designer Winter Coat - Size M",
    description: "Luxury winter coat from premium brand. Worn only a few times, excellent condition. Perfect for cold weather.",
    price: 180,
    category: "Clothing",
    location: "Lefkosa",
    sellerId: "user4",
    seller: "Ayşe Özkan",
    sellerProfile: mockUserProfiles[3],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 1 week ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/coat1.jpg", "https://example.com/coat2.jpg"]
  },
  {
    id: "prod5",
    title: "Programming Books Collection",
    description: "Collection of 8 programming books including React, Node.js, and Python guides. Great for students and developers.",
    price: 65,
    category: "Books",
    location: "Iskele",
    sellerId: "user5",
    seller: "Chris Wilson",
    sellerProfile: mockUserProfiles[4],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/books1.jpg"]
  },
  {
    id: "prod6",
    title: "Samsung 55\" 4K Smart TV",
    description: "Excellent condition Samsung Smart TV with 4K resolution. Perfect for streaming and gaming. Includes remote and all cables.",
    price: 520,
    category: "Electronics",
    location: "Guzelyurt",
    sellerId: "user1",
    seller: "Ahmed Hassan",
    sellerProfile: mockUserProfiles[0],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)), // 4 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/tv1.jpg", "https://example.com/tv2.jpg"]
  },
  {
    id: "prod7",
    title: "Comfortable Office Chair",
    description: "Ergonomic office chair with lumbar support. Perfect for working from home. Adjustable height and armrests.",
    price: 150,
    category: "Furniture",
    location: "Girne",
    sellerId: "user2",
    seller: "Maria Georgiou",
    sellerProfile: mockUserProfiles[1],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)), // 6 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/chair1.jpg"]
  },
  {
    id: "prod8",
    title: "Tennis Racket - Wilson Pro Staff",
    description: "Professional tennis racket in great condition. Comes with protective cover and extra grip tape.",
    price: 95,
    category: "Sports",
    location: "Famagusta",
    sellerId: "user3",
    seller: "John Smith",
    sellerProfile: mockUserProfiles[2],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)), // 8 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/racket1.jpg"]
  },
  {
    id: "prod9",
    title: "Vintage Leather Jacket - Size L",
    description: "Authentic vintage leather jacket with classic design. Well-preserved and stylish. Perfect for casual wear.",
    price: 220,
    category: "Clothing",
    location: "Lefkosa",
    sellerId: "user4",
    seller: "Ayşe Özkan",
    sellerProfile: mockUserProfiles[3],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)), // 10 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/jacket1.jpg", "https://example.com/jacket2.jpg"]
  },
  {
    id: "prod10",
    title: "Garden Tools Set",
    description: "Complete garden tools set including spade, rake, pruning shears, and watering can. Perfect for home gardening.",
    price: 75,
    category: "Home & Garden",
    location: "Iskele",
    sellerId: "user5",
    seller: "Chris Wilson",
    sellerProfile: mockUserProfiles[4],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)), // 12 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/tools1.jpg"]
  },
  {
    id: "prod11",
    title: "MacBook Air M1 - 256GB",
    description: "Apple MacBook Air with M1 chip, 8GB RAM, 256GB storage. Excellent performance for work and creative tasks. Minor signs of use.",
    price: 750,
    category: "Electronics",
    location: "Guzelyurt",
    sellerId: "user1",
    seller: "Ahmed Hassan",
    sellerProfile: mockUserProfiles[0],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)), // 2 weeks ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/macbook1.jpg", "https://example.com/macbook2.jpg"]
  },
  {
    id: "prod12",
    title: "Modern Coffee Table - Glass Top",
    description: "Sleek modern coffee table with tempered glass top and chrome legs. Perfect for contemporary living rooms.",
    price: 180,
    category: "Furniture",
    location: "Girne",
    sellerId: "user2",
    seller: "Maria Georgiou",
    sellerProfile: mockUserProfiles[1],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)), // 9 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/coffeetable1.jpg"]
  },
  {
    id: "prod13",
    title: "Gaming Headset - SteelSeries",
    description: "High-quality gaming headset with surround sound and noise-canceling microphone. Perfect for gaming and calls.",
    price: 85,
    category: "Electronics",
    location: "Famagusta",
    sellerId: "user3",
    seller: "John Smith",
    sellerProfile: mockUserProfiles[2],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)), // 11 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/headset1.jpg"]
  },
  {
    id: "prod14",
    title: "Car Tire Set - 205/55R16",
    description: "Set of 4 car tires in good condition with plenty of tread remaining. Suitable for most compact and mid-size cars.",
    price: 280,
    category: "Automotive",
    location: "Lefkosa",
    sellerId: "user4",
    seller: "Ayşe Özkan",
    sellerProfile: mockUserProfiles[3],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)), // 15 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/tires1.jpg", "https://example.com/tires2.jpg"]
  },
  {
    id: "prod15",
    title: "Vintage Camera - Canon AE-1",
    description: "Classic Canon AE-1 film camera in working condition. Great for photography enthusiasts and collectors. Includes original lens.",
    price: 195,
    category: "Electronics",
    location: "Iskele",
    sellerId: "user5",
    seller: "Chris Wilson",
    sellerProfile: mockUserProfiles[4],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)), // 13 days ago
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)),
    status: "active",
    images: ["https://example.com/camera1.jpg"]
  }
]

// Function to simulate real-time subscription for mock products
export const subscribeMockProducts = (callback: (products: any[]) => void) => {
  let currentProducts = [...mockProducts]; // Use a mutable copy

  // Initial load
  setTimeout(() => {
    callback(currentProducts);
  }, 500); // Shorter delay for mock data

  // Simulate real-time updates (optional)
  const interval = setInterval(() => {
    const shouldUpdate = Math.random() < 0.2; // Higher chance for visible updates
    if (shouldUpdate) {
      // Create a new product to add
      const newProductId = `prod${currentProducts.length + 1}`;
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomLocation = locationData[Math.floor(Math.random() * locationData.length)].name;
      const randomSellerProfile = mockUserProfiles[Math.floor(Math.random() * mockUserProfiles.length)];

      const newProduct = {
        id: newProductId,
        title: `Newly Added Product ${newProductId}`,
        description: `This is a new product added at ${new Date().toLocaleTimeString()}.`,
        price: Math.floor(Math.random() * 500) + 50, // Price between 50 and 550
        category: randomCategory === "All" ? "Other" : randomCategory, // Avoid "All" category
        location: randomLocation,
        sellerId: randomSellerProfile.uid,
        seller: randomSellerProfile.displayName,
        sellerProfile: randomSellerProfile,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        status: "active",
        images: ["https://via.placeholder.com/150"] // Placeholder image
      };

      // Add the new product to the beginning (to show up as "newest")
      currentProducts = [newProduct, ...currentProducts];
      callback(currentProducts);
    }
  }, 10000); // Simulate updates every 10 seconds

  // Return cleanup function
  return () => clearInterval(interval);
}

// Just to make sure 'categories' is defined for the mock-data-utils
const categories = ["All", "Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden", "Automotive", "Other"];