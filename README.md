# Facebook Marketplace Clone with Real-time Chat & Photo Sharing

A modern, full-featured marketplace application built with Next.js 15, React 19, Firebase, and Socket.io. Features real-time messaging, photo uploads, user authentication, and comprehensive CRUD operations.

## 🚀 Features

### Core Marketplace Features
- **User Authentication**: Firebase Auth with login/signup
- **Advanced Filtering**: Filter by category, location with item counters
- **Smart Search**: Search through titles and descriptions
- **Flexible Sorting**: Sort by newest, oldest, price (low/high), or name
- **Interactive Categories**: Button-based category selection with counts
- **Location-Based Filtering**: Dropdown location filter with item counts
- **Product Details**: Comprehensive product information with images
- **Favorites System**: Save and manage favorite items
- **User Profiles**: Personal profile management
- **Filter Management**: Active filters display with easy removal

### 📸 Responsive Photo Management
- **Touch-Friendly Upload**: Mobile-optimized drag & drop with tap-to-select
- **Demo Mode**: Local storage for immediate testing without Firebase
- **Progress Tracking**: Visual upload progress with mobile-friendly UI
- **Multiple Photos**: Support for up to 10 photos per listing
- **Mobile Camera**: Direct camera access on mobile devices
- **Responsive Gallery**: Adaptive photo display for all screen sizes
- **Error Handling**: Retry functionality with touch-optimized controls

### 💬 Responsive Real-time Chat System
- **Mobile-First Design**: Adaptive layout with touch-friendly interface
- **Live Messaging**: Mock real-time communication (updates every second)
- **Conversation Management**: Easy navigation between chats on all devices
- **Photo Sharing**: Send and view images with full-screen preview
- **Local Storage**: Messages stored locally for immediate testing
- **Professional UI**: WhatsApp-style responsive interface
- **Touch Optimized**: Large touch targets and gesture navigation
- **Demo Mode**: Works immediately without any setup

### 🔒 Security & Permissions
- **Firestore Security Rules**: Comprehensive data access control
- **User-based Permissions**: Users can only edit their own content
- **Authentication Required**: Protected routes and API endpoints
- **Data Validation**: Server-side validation for all inputs

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching with next-themes
- **Radix UI Components**: Accessible, customizable component library
- **Smooth Animations**: CSS transitions and hover effects
- **Loading States**: Skeleton screens and progress indicators

## 🛠 Technology Stack

### Frontend
- **Next.js 15**: App Router, Server Components, TypeScript
- **React 19**: Latest React features and hooks
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon library
- **React Hook Form**: Form validation and management
- **Zod**: Runtime type validation

### Backend & Database
- **Firebase Firestore**: NoSQL database for real-time data
- **Firebase Storage**: File storage and CDN
- **Firebase Auth**: User authentication and management
- **Socket.io**: Real-time bidirectional communication
- **Node.js**: Custom server for Socket.io integration

### Development Tools
- **TypeScript**: Type safety and developer experience
- **ESLint**: Code linting and formatting
- **React Dropzone**: File upload handling
- **date-fns**: Date manipulation and formatting
- **UUID**: Unique identifier generation

## 📁 Project Structure

```
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   ├── profile/                  # User profile pages
│   ├── sell/                     # Create listing page
│   ├── firebase.ts               # Firebase configuration
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page with marketplace
├── components/                   # React components
│   ├── ui/                       # Radix UI components
│   ├── chat-interface.tsx        # Real-time chat component
│   ├── photo-upload.tsx          # Photo upload component
│   └── theme-provider.tsx        # Theme context provider
├── hooks/                        # Custom React hooks
│   ├── use-socket.ts             # Socket.io client hook
│   ├── use-mobile.tsx            # Mobile detection hook
│   └── use-toast.ts              # Toast notification hook
├── lib/                          # Utility libraries
│   ├── firebase-utils.ts         # Firestore helper functions
│   └── utils.ts                  # General utilities
├── public/                       # Static assets
├── styles/                       # Global styles
├── server.js                     # Socket.io server
├── firestore.rules               # Firestore security rules
├── storage.rules                 # Firebase Storage rules
└── package.json                  # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd facebook-marketplace-clone
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Copy your Firebase config to `app/firebase.ts`
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`
5. Deploy Storage rules: `firebase deploy --only storage`

### 4. Environment Variables
Create a `.env.local` file:
```env
# Add any environment-specific variables here
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... other Firebase config
```

### 5. Run Development Server
```bash
# Start the Next.js + Socket.io server
npm run dev

# Or run Next.js only (without real-time features)
npm run dev:next
```

### 6. Build for Production
```bash
npm run build
npm start
```

## 🔥 Firebase Collections

### Users Collection
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
}
```

### Products Collection
```typescript
{
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  isNegotiable: boolean;
  image: string;
  photos: Photo[];
  userId: string;
  createdAt: Timestamp;
}
```

### Photos Collection
```typescript
{
  id: string;
  url: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  productId?: string;
  metadata: {
    size: number;
    type: string;
  };
}
```

### Conversations Collection
```typescript
{
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  unreadCount?: { [userId: string]: number };
  productId?: string;
  productTitle?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Messages Subcollection
```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Timestamp;
  type: 'text' | 'image';
  photoUrl?: string;
  read: boolean;
}
```

## 🔐 Security Rules

The app implements comprehensive Firestore security rules:

- **Authentication Required**: All operations require user authentication
- **User Data Isolation**: Users can only access their own data
- **Product Permissions**: Users can only edit their own listings
- **Chat Permissions**: Users can only access conversations they participate in
- **Photo Permissions**: Users can only manage their own uploaded photos

## 🎯 Key Features Implementation

### Real-time Chat
- Socket.io server integration with Next.js
- Real-time message broadcasting
- Typing indicators and user presence
- Message read receipts
- Photo sharing in conversations

### Photo Upload System
- Drag & drop interface with react-dropzone
- Firebase Storage integration
- Progress tracking and error handling
- Image validation (file type, size limits)
- Multiple photo support per listing

### Database Operations
- Real-time Firestore listeners
- Optimistic UI updates
- Error handling and retry logic
- Batch operations for performance
- Offline support with Firebase

## 🔧 Customization

### Styling
- Modify `tailwind.config.ts` for theme customization
- Update CSS variables in `globals.css`
- Customize Radix UI components in `components/ui/`

### Firebase Rules
- Update `firestore.rules` for custom security requirements
- Modify `storage.rules` for file upload permissions

### Socket.io Events
- Add custom events in `server.js`
- Update client hooks in `hooks/use-socket.ts`

## 📱 Mobile-First Responsive Design

The app is built mobile-first and fully optimized for all devices:

### 📱 Mobile Chat Experience
- **Adaptive Layout**: Conversations list slides out on mobile, full-screen on desktop
- **Touch Navigation**: Back buttons, swipe gestures, and large touch targets
- **Mobile Keyboard**: Optimized input handling and auto-resize
- **Photo Viewing**: Full-screen image preview with tap-to-zoom

### 📸 Mobile Photo Upload  
- **Camera Integration**: Direct camera access on mobile devices
- **Touch Upload**: Large touch areas for photo selection
- **Progress Indicators**: Mobile-friendly upload progress
- **Error Recovery**: Touch-optimized retry and remove controls

### 🎨 Responsive UI Elements
- **Breakpoint System**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Flexible Grids**: Auto-adjusting product grids (1-6 columns based on screen)
- **Touch-Friendly**: 44px minimum touch targets throughout
- **Typography**: Responsive text sizing with readability optimization

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy with automatic Socket.io support

### Other Platforms
For platforms without WebSocket support, you may need to:
1. Deploy Socket.io server separately
2. Update client to connect to external Socket.io server
3. Configure CORS settings appropriately

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Firebase**: For providing excellent backend services
- **Radix UI**: For accessible component primitives
- **Socket.io**: For real-time communication capabilities
- **Tailwind CSS**: For utility-first styling approach
- **Next.js Team**: For the excellent React framework

---

Built with ❤️ using modern web technologies.