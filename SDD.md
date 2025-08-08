## Software Design Description (SDD)

- Project: Facebook Marketplace Clone with Real-time Chat & Photo Sharing
- Version: 1.0
- Date: 2025-08-08
- Status: Draft

## 1. System Overview
A Next.js-based marketplace application with Firebase backend services and a Socket.io real-time layer for chat and presence. The app supports listings CRUD, photo uploads, favorites, user profiles, and a responsive real-time chat interface.

## 2. Architectural Design
### 2.1 High-Level Architecture
- Client (Next.js 15 + React 18)
  - App Router with server/client components
  - Tailwind CSS and Radix UI
  - Hooks for sockets, mobile detection, and toasts
- Real-time Engine (Socket.io)
  - Node.js server integrated with Next.js (`server.js`)
  - Rooms per conversation; in-memory maps for presence and room membership
- Backend Services (Firebase)
  - Auth for user identity
  - Firestore for data persistence
  - Storage for photo files

### 2.2 System Context and Data Flow
- User actions on the client trigger Firestore reads/writes and Socket.io events.
- Photo uploads stream to Firebase Storage; metadata stored in Firestore.
- Chat uses Socket.io rooms keyed by `conversationId`; events broadcast to room members.

## 3. Module and Component Design
### 3.1 App Directory (`app/`)
- `auth/`: Authentication screens and flows
- `profile/`: User profile management
- `sell/`: Listing creation and management
- `products/`, `photos/`, `messages/`, `notifications/`: Feature pages and layouts
- `firebase.ts`: Firebase client initialization (keys via env)
- `layout.tsx` and `page.tsx`: Shell and home page with marketplace UI

### 3.2 Components (`components/`)
- `chat-interface.tsx`: Real-time chat UI; integrates with Socket.io via `use-socket`
- `chat-interface-mock.tsx`: Demo-only local storage chat
- `photo-upload.tsx`: Upload widget with progress, validations, drag & drop, camera
- `photo-upload-mock.tsx`: Demo-only local storage uploads
- `photo-gallery.tsx`: Responsive gallery for product photos
- `product-card.tsx`: Listing card with actions
- `marketplace-nav.tsx`, `marketplace-sidebar.tsx`: Navigation and filters
- `theme-provider.tsx`: Light/dark theme context

### 3.3 Hooks (`hooks/`)
- `use-socket.ts`: Encapsulates Socket.io client connection, room join/leave, event handlers
- `use-mobile.tsx`: Mobile detection and responsive behaviors
- `use-toast.ts`: Toast notifications

### 3.4 Libraries (`lib/`)
- `firebase-utils.ts`: Firestore queries, listeners, and write helpers
- `utils.ts`: Pure utilities (formatting, guards, etc.)

## 4. Data Design
### 4.1 Firestore Collections
- Users: `{ uid, displayName, email, createdAt, lastLogin }`
- Products: `{ id, title, description, price, category, condition, location, isNegotiable, image, photos[], userId, createdAt }`
- Photos: `{ id, url, filename, uploadedBy, uploadedAt, productId?, metadata{ size, type } }`
- Conversations: `{ id, participants[], participantNames{}, lastMessage?, lastMessageTime?, unreadCount?, productId?, productTitle?, createdAt, updatedAt }`
- Messages (subcollection): `{ id, conversationId, senderId, senderName, content, timestamp, type, photoUrl?, read }`

### 4.2 Indexing
- Compound indexes as defined in `firestore.indexes.json` for search/filter/sort.

### 4.3 Storage Structure
- `uploads/users/{uid}/products/{productId}/{filename}`
- Metadata mirrored in Firestore; Storage rules restrict access.

## 5. Real-time Chat Design (Socket.io)
### 5.1 Server State (`server.js`)
- `activeUsers: Map<userId, { socketId, userName, isOnline }>`
- `conversationRooms: Map<conversationId, Set<userId>>`

### 5.2 Events
- Client emits: `join`, `join_conversation`, `leave_conversation`, `send_message`, `typing_start`, `typing_stop`, `mark_read`
- Server emits: `user_online`, `user_status_changed`, `new_message`, `user_typing`, `messages_read`

### 5.3 Sequences (Textual)
- Join:
  1) Client emits `join` with `{ userId, userName }`
  2) Server stores presence in `activeUsers`; broadcasts `user_online`
- Enter conversation:
  1) Client emits `join_conversation(conversationId)`
  2) Server joins socket to room, adds to `conversationRooms`
- Send message:
  1) Client emits `send_message({ conversationId, message })`
  2) Server `emit('new_message')` to room with server timestamp
- Typing:
  - `typing_start/stop` relay `user_typing` to room
- Read receipts:
  - `mark_read` relays `messages_read` with `messageIds` and `readBy`
- Disconnect:
  - Server marks user offline, broadcasts, cleans room membership, delayed cleanup

### 5.4 Error Handling
- Socket error event logged; client should retry with backoff.
- Guard for missing `socket.userId` on room operations in client code.

## 6. Security Design
- Firestore rules enforce owner-based access for listings, photos, and conversations.
- Storage rules restrict uploads and reads to authorized users.
- Authentication gating for protected routes and Socket.io `join` flow.

## 7. UI/UX Design
- Mobile-first; minimum 44px touch targets; responsive grids.
- Theming via `next-themes` and Radix UI primitives.
- Skeletons, optimistic UI, and toasts for perceived performance.

## 8. Performance Considerations
- Use Firestore real-time listeners with query limits and indexes.
- Batch writes for multi-document updates.
- Debounce typing indicators; avoid excessive emits.
- Image size validation and optional client compression before upload.

## 9. Deployment Design
- Dev: `npm run dev` starts Next.js + Socket.io on same process.
- Prod: `npm run build` then `npm start`; consider separate Socket.io service if host lacks WS support. Configure CORS accordingly.
- Environment variables in `.env.local` (prefixed `NEXT_PUBLIC_` for client as needed).

## 10. Logging and Monitoring
- Server: stdout logs for connections, joins, leaves, messages; integrate with external logs in prod.
- Client: Non-PII error logs; surface toasts for user-facing issues.
- Firebase: Enable usage metrics and performance monitoring.

## 11. Testing Strategy
- Unit: Utilities and hooks (mock Socket.io, Firestore)
- Integration: Listing CRUD, photo upload flows, chat send/receive
- E2E: Core buyer/seller journeys on mobile and desktop
- Security: Rule unit tests using Firebase emulator

## 12. Migration and Data Lifecycle
- Soft-delete listings; Storage object cleanup via scheduled job if needed.
- Data retention policy for messages (configurable, e.g., 12 months) TBD.

## 13. Risks and Mitigations
- Presence accuracy vs. reconnects: lazy cleanup with 5s delay; consider heartbeats.
- Scalability of in-memory maps: external store (Redis) when horizontally scaling Socket.io.
- Browser storage limits for demo mode: scope demo data size and expiry.

## 14. Open Items / Future Work
- Push notifications (Web Push / FCM).
- Admin moderation tools and reporting.
- Internationalization and localization.
- Image transformations via CDN (e.g., Cloudinary) for thumbnails.