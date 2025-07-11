# Quick Setup Guide

## Switching Between Mock Data and Real Firebase Data

The application is currently configured to use **mock data** for easy testing. Here's how to switch between modes:

### 🧪 Current Mode: Mock Data
- **Products**: 6 sample products with realistic data
- **No Firebase required**: Works immediately without setup
- **Perfect for**: UI testing, development, demonstrations

### 🔄 Switch to Real Firebase Data

**Option 1: Firebase Only**
In `app/page.tsx`, around line 160:

```typescript
// Comment out this section:
// useEffect(() => {
//   if (!isLoggedIn) return
//   setProductsLoading(true)
//   setTimeout(() => {
//     setProducts(mockProducts)
//     setProductsLoading(false)
//   }, 500)
// }, [isLoggedIn])

// Uncomment this section:
useEffect(() => {
  if (!isLoggedIn) return
  
  setProductsLoading(true)
  const unsubscribe = subscribeToProducts((newProducts) => {
    setProducts(newProducts)  // Only real Firebase products
    setProductsLoading(false)
  })
  
  return () => unsubscribe()
}, [isLoggedIn])
```

**Option 2: Firebase + Mock Data (Hybrid)**
```typescript
useEffect(() => {
  if (!isLoggedIn) return
  
  setProductsLoading(true)
  const unsubscribe = subscribeToProducts((newProducts) => {
    // Combine real products with mock products
    setProducts([...newProducts, ...mockProducts])
    setProductsLoading(false)
  })
  
  return () => unsubscribe()
}, [isLoggedIn])
```

### 🔥 Firebase Setup Required

If switching to real data, ensure:

1. **Firebase Indexes are deployed**:
   ```bash
   firebase login
   firebase deploy --only firestore:indexes
   ```

2. **Firestore rules are updated**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Create the required index** using the link in console errors, or wait for automatic deployment.

### 🎯 Current Features Working

**With Mock Data:**
- ✅ **Advanced Product Filtering** - Categories, locations, price range  
- ✅ **Interactive Filter UI** - Button-based categories with item counters
- ✅ **Location Dropdown** - Filter by location with item counts
- ✅ **Price Range Slider** - Expandable price filtering ($0-$2000+)
- ✅ **Multiple Sorting Options** - Newest, oldest, price (low/high), name A-Z
- ✅ **Smart Search** - Search through titles & descriptions
- ✅ **Active Filter Management** - Visual filter tags with easy removal
- ✅ **Responsive Chat System** - Mobile-optimized real-time messaging
- ✅ **Photo Upload & Sharing** - Upload photos and share in chat
- ✅ **Mobile-First Design** - Touch-friendly UI for all devices
- ✅ **Professional Interface** - Facebook Marketplace-style layout

**Additional with Firebase:**
- ✅ Persistent product storage
- ✅ Real-time product updates
- ✅ Photo storage in cloud
- ✅ Cross-device synchronization

### 📝 Mock Data Details

The mock data includes:
- 6 realistic products across different categories
- Proper seller names and avatars
- Realistic timestamps (1 day ago, 2 days ago, etc.)
- All product fields match Firebase schema
- Chat functionality works with mock sellers

### 💬 Responsive Chat System (Mock Mode)

The chat system is **fully responsive** and using **mock mode**:
- **Mobile-First Design** - Adaptive layout for all screen sizes
- **Touch-Friendly** - Large touch targets and gesture navigation  
- **Photo Sharing** - Upload and view images with full-screen preview
- **Local Storage** - Messages stored locally, no Firebase needed
- **Real-time Simulation** - Updates every second for realistic experience
- **Professional UI** - WhatsApp-style responsive interface

**To switch to real Firebase chat:**
In `app/page.tsx`:
```typescript
// Change this line:
import { ChatInterfaceMock } from "../components/chat-interface-mock"
// To this:
import { ChatInterface } from "../components/chat-interface"

// And change the component:
<ChatInterfaceMock ... />
// To:
<ChatInterface ... />
```

### �🚀 Ready to Go!

The app is ready to use immediately with mock data, or can be switched to Firebase with a simple code change when you're ready to go live!