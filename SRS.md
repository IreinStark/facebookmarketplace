## Software Requirements Specification (SRS)

- Project: Facebook Marketplace Clone with Real-time Chat & Photo Sharing
- Version: 1.0
- Date: 2025-08-08
- Status: Draft

## 1. Purpose
Define the functional and non-functional requirements for a marketplace web application featuring listings, photo uploads, favorites, user profiles, and real-time chat. This SRS will guide development, testing, and acceptance.

## 2. Scope
- Web application built with Next.js and React for buyers and sellers to browse, post, and chat about products.
- Backend services provided by Firebase (Auth, Firestore, Storage) and a Node.js Socket.io server for real-time chat and presence.

## 3. Definitions, Acronyms, and Abbreviations
- NFR: Non-Functional Requirement
- FR: Functional Requirement
- RTE: Real-time Engine (Socket.io)
- CRUD: Create, Read, Update, Delete

## 4. References
- `README.md` (features, stack, setup)
- `server.js` (Socket.io events and behavior)
- `firestore.rules`, `storage.rules` (security)
- `firestore.indexes.json` (indexes)
- `package.json` (dependencies, scripts)

## 5. Overall Description
### 5.1 Product Perspective
- Client: Next.js 15 (App Router), React 18, Tailwind CSS, Radix UI.
- Backend: Firebase (Auth, Firestore, Storage). Node.js server hosting Next.js with integrated Socket.io for chat and presence.
- Data: Firestore collections for users, products, conversations, and messages; Storage for photos.

### 5.2 User Classes and Characteristics
- Buyer: Browses, filters, favorites, chats with sellers.
- Seller: Creates/edits listings with photos, chats with buyers.
- Authenticated User: Can perform buyer/seller actions; unauthenticated users have limited browsing.

### 5.3 Operating Environment
- Browsers: Latest Chrome, Firefox, Safari, Edge (desktop/mobile).
- Node.js ≥ 18 for server-side.
- Firebase project with Firestore, Storage, Auth.

### 5.4 Design and Implementation Constraints
- WebSocket support required for integrated real-time features; optional external Socket.io server on platforms without WS support.
- Firestore security rules govern access.
- Single-page app with Next.js routing; SEO considerations for public pages.

### 5.5 Assumptions and Dependencies
- Users have stable internet for real-time chat and uploads.
- Images limited to supported MIME types and size thresholds.
- Firebase quotas and billing limits are respected.

## 6. Functional Requirements

### 6.1 Authentication and Profile
- FR-Auth-1: Users can sign up, sign in, and sign out via Firebase Auth.
- FR-Auth-2: Authenticated users can view and edit their profile information.
- FR-Auth-3: Protected routes require authentication.
- Acceptance:
  - Given an unauthenticated user, when accessing protected pages, then the user is redirected or shown a login prompt.

### 6.2 Product Listings
- FR-Prod-1: Users can create, read, update, and delete their own product listings.
- FR-Prod-2: Listings include title, description, price, category, condition, location, negotiable flag, primary image, and up to 10 photos.
- FR-Prod-3: Users can browse listings in a responsive grid.
- FR-Prod-4: Users can view a product details page with photos and seller information.
- Acceptance:
  - Create listing with required fields validates and persists to Firestore; owner can edit/delete; others cannot.

### 6.3 Search, Filter, Sort
- FR-Search-1: Users can search by title and description.
- FR-Filter-1: Users can filter by category and location; UI displays counts per filter.
- FR-Sort-1: Users can sort by newest, oldest, price (asc/desc), and name.

### 6.4 Favorites
- FR-Fav-1: Authenticated users can add/remove items from favorites.
- FR-Fav-2: Favorites are retrievable per user.

### 6.5 Photo Uploads
- FR-Photo-1: Users can upload up to 10 images per listing with progress indicators.
- FR-Photo-2: Validate file type and size; show retry on errors.
- FR-Photo-3: Support drag & drop and mobile camera capture where supported.
- FR-Photo-4: Store files in Firebase Storage and metadata in Firestore.

### 6.6 Real-time Chat
- FR-Chat-1: Authenticated users can start and participate in conversations related to listings.
- FR-Chat-2: Messages support text and images.
- FR-Chat-3: Typing indicators, read receipts, and presence are supported via Socket.io.
- FR-Chat-4: Conversation list with unread counts and last message preview.

### 6.7 Notifications
- FR-Notify-1: In-app toast/alerts for message receipts, upload status, and errors.

### 6.8 Demo/Offline Modes
- FR-Demo-1: Local storage fallback for chat and photo uploads is available for immediate testing without Firebase.

## 7. Data Requirements
- Users: `{ uid, displayName, email, createdAt, lastLogin }`
- Products: `{ id, title, description, price, category, condition, location, isNegotiable, image, photos[], userId, createdAt }`
- Photos: `{ id, url, filename, uploadedBy, uploadedAt, productId?, metadata{ size, type } }`
- Conversations: `{ id, participants[], participantNames{}, lastMessage?, lastMessageTime?, unreadCount?, productId?, productTitle?, createdAt, updatedAt }`
- Messages: `{ id, conversationId, senderId, senderName, content, timestamp, type: 'text'|'image', photoUrl?, read }`

Constraints:
- Max 10 photos per listing; enforce type and size validation on client.
- Indexes defined in `firestore.indexes.json` must be deployed as needed for queries.

## 8. External Interface Requirements
### 8.1 Socket.io Events (from `server.js`)
- Client emits:
  - `join`: `{ userId, userName }`
  - `join_conversation`: `conversationId`
  - `leave_conversation`: `conversationId`
  - `send_message`: `{ conversationId, message }`
  - `typing_start`: `{ conversationId }`
  - `typing_stop`: `{ conversationId }`
  - `mark_read`: `{ conversationId, messageIds }`
- Server emits:
  - `user_online`: `{ userId, userName, isOnline }`
  - `user_status_changed`: `{ userId, isOnline }`
  - `new_message`: `{ ...message, timestamp }`
  - `user_typing`: `{ userId, userName, isTyping }`
  - `messages_read`: `{ conversationId, messageIds, readBy }`

### 8.2 Firebase Interfaces
- Auth: Email/password (others optional).
- Firestore: CRUD via client SDK with security rules.
- Storage: File upload with resumable uploads and rules enforcement.

## 9. Non-Functional Requirements
- NFR-Perf-1: Chat message delivery latency ≤ 1s under normal conditions.
- NFR-Perf-2: Home page loads LCP ≤ 2.5s on 4G for P95.
- NFR-Avail-1: Service uptime target 99.5% monthly (excluding Firebase SLA events).
- NFR-Sec-1: Enforce Firestore and Storage rules; authenticated access required for writes.
- NFR-Priv-1: Limit access to user-owned data; conversations visible only to participants.
- NFR-UX-1: Mobile-first responsive UI with 44px minimum touch targets.
- NFR-A11y-1: Meet WCAG 2.1 AA for core flows (navigation, forms, chat, uploads).
- NFR-Compat-1: Support last two major versions of modern browsers.
- NFR-Scal-1: Support 5k concurrent Socket.io connections on dedicated server tier; ability to shard by namespace/room.
- NFR-Maint-1: TypeScript codebase with ESLint; CI lint pass required.

## 10. Security and Privacy
- Firestore rules limit read/write to authenticated users and record owners.
- Storage rules restrict file operations to uploading user and related product.
- Do not store secrets client-side; use environment variables for config.

## 11. Reliability and Recovery
- Socket disconnects handled gracefully; user marked offline after timeout.
- Retry logic for uploads and transient Firestore errors.

## 12. Acceptance Criteria (High Level)
- Authenticated user can create a listing with photos, visible on homepage.
- Another authenticated user can favorite the listing and start a conversation with real-time messaging and typing indicators.
- Firestore rules prevent unauthorized listing edits and conversation access.

## 13. Risks and Mitigations
- R1: WebSocket unsupported on host → Mitigation: Deploy Socket.io separately; update client URL and CORS.
- R2: Firebase quota limits → Mitigation: Add rate limiting and caching; monitor usage.
- R3: Large image uploads → Mitigation: Client-side compression and size validation.

## 14. Deployment and Environment
- Dev: `npm run dev` (Next.js + Socket.io), `.env.local` with Firebase config.
- Prod: `npm run build` then `npm start` behind reverse proxy; Vercel recommended (may require external Socket.io server).

## 15. Open Issues / TBD
- Push notifications beyond in-app toasts: TBD.
- Admin/moderation tools: TBD.
- Internationalization and localization: TBD.