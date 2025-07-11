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
- ✅ Product browsing and filtering
- ✅ Search functionality  
- ✅ Real-time chat (create conversations)
- ✅ Photo upload on sell page
- ✅ Responsive design
- ✅ All UI components

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

### � Chat System (Mock Mode)

The chat system is currently using **mock mode** to work without Firebase:
- **Messages stored locally** - No Firebase setup needed
- **Real-time simulation** - Updates every second  
- **Full functionality** - Send text, photos, create conversations
- **Professional UI** - Looks and feels like real chat

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