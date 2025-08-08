# Facebook Marketplace Clone

A modern marketplace web app with real‑time chat and photo sharing. Built with Next.js 15, React 18, TypeScript, Tailwind CSS, Firebase, and Socket.io.

## Features

- **Marketplace**: browse, search, sort, and filter listings (category, location, price)
- **Listings**: create/read/update/delete products with multiple photos
- **Auth**: Firebase Authentication (email/password)
- **Real‑time chat**: conversations, typing indicators, read receipts, photo messages
- **Photo uploads**: drag & drop, progress, validation, Cloudinary/Firebase ready
- **Mobile‑first UI**: responsive layout, dark/light theme, accessible components

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI, Lucide
- **Realtime**: Socket.io (custom Node server in `server.js`)
- **Backend/DB**: Firebase (Auth, Firestore, Storage)
- **Forms/Validation**: React Hook Form, Zod

## Quickstart

### Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)
- Optional: Firebase project (for real data), Cloudinary (for uploads)

### Install
```bash
npm install --legacy-peer-deps
```

### Environment
Create `.env.local` with your Firebase config (if using real data):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Run
```bash
# Next.js + Socket.io custom server (recommended for full functionality)
npm run dev

# Next.js only (no Socket.io)
npm run dev:next
```

### Build & Start
```bash
npm run build
npm start
```

## Scripts

- `dev`: start custom Node server (`server.js`) with Next.js and Socket.io
- `dev:next`: start Next.js dev server only
- `build`: production build
- `start`: start custom Node server in production

## Data Modes (Mock vs Firebase)

The app works out‑of‑the‑box with mock data. Switch to Firebase when ready.
- See `SETUP.md` for exact code changes to toggle between modes, including:
  - replacing mock products with Firestore subscriptions
  - switching chat from mock UI to the live Socket.io client

## Firebase Setup

- Deploy Firestore rules and indexes (required for real data):
```bash
firebase login
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```
- Update `storage.rules` if needed, then:
```bash
firebase deploy --only storage
```

Relevant files:
- `firestore.rules`, `firestore.indexes.json`, `storage.rules`
- App config at `app/firebase.ts`

## Cloudinary (Optional)

Photo uploads support Cloudinary. See `CLOUDINARY_SETUP.md` to configure `lib/cloudinary-config.ts` and test uploads.

## Realtime Chat

- Custom Socket.io server lives in `server.js` (started by `npm run dev`/`npm start`)
- Handles: presence, join/leave conversation rooms, messages, typing indicators, read receipts
- Client hook and components integrate with this server (see `components/chat-interface.tsx` and `hooks`)

## Project Structure

```
app/                 # Next.js App Router pages and layout
components/          # UI, marketplace, chat, photo upload components
hooks/               # Custom hooks (socket, mobile, toasts)
lib/                 # Utilities and Firebase helpers
public/              # Static assets
server.js            # Custom Node server with Socket.io
styles/              # Tailwind and global styles
```

## Development Notes

- Type checking and ESLint can be relaxed during builds (see `next.config.mjs`), re‑enable as needed.
- Images are unoptimized by default for simplicity during development.

## Deployment

- For WebSockets, use a Node host that supports long‑lived connections (e.g., Railway, Render, Fly.io, VPS/Docker).
- If deploying to platforms without native WebSocket support, consider running the Socket.io server separately and point the client to it (configure CORS accordingly).

## Acknowledgements

- Next.js, React, Tailwind CSS, Radix UI, Firebase, Socket.io, and the open‑source community.