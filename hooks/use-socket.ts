import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
}

export function useSocket(user?: { uid: string } | null): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only initialize socket if user exists and has uid
    if (!user?.uid) {
      // Clean up existing socket if user becomes null/undefined
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Check if socket server is available before connecting
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    
    // For development, you might want to disable socket connection if server isn't running
    if (!process.env.NEXT_PUBLIC_SOCKET_URL && process.env.NODE_ENV === 'development') {
      console.log('Socket server URL not configured, skipping socket connection')
      return
    }

    // Initialize socket connection with better error handling
    const socketInstance = io(socketUrl, {
      auth: {
        userId: user.uid
      },
      autoConnect: true,
      timeout: 5000, // 5 second timeout
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    })

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.warn('Socket connection error (this is normal if no socket server is running):', error.message)
      setIsConnected(false)
      // Don't throw error, just log it as socket is optional for the marketplace
    })

    socketInstance.on('reconnect_error', (error) => {
      console.warn('Socket reconnection error:', error.message)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Cleanup function
    return () => {
      if (socketInstance) {
        socketInstance.off('connect')
        socketInstance.off('disconnect')
        socketInstance.off('connect_error')
        socketInstance.off('reconnect_error')
        socketInstance.disconnect()
      }
      setSocket(null)
      setIsConnected(false)
    }
  }, [user?.uid]) // Only depend on user.uid

  return { socket, isConnected }
}