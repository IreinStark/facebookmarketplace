"use client"

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  userId?: string;
  userName?: string;
  enabled?: boolean;
}

interface SocketState {
  connected: boolean;
  error: string | null;
}

interface UserStatus {
  userId: string;
  userName: string;
  isOnline: boolean;
}

interface TypingStatus {
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface MessageReadStatus {
  conversationId: string;
  messageIds: string[];
  readBy: string;
}

export function useSocket({ userId, userName, enabled = true }: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<SocketState>({
    connected: false,
    error: null
  });
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserStatus>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !userId || !userName) return;

    const socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setSocketState({ connected: true, error: null });
      
      // Join the socket with user information
      socket.emit('join', { userId, userName });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketState({ connected: false, error: null });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketState({ connected: false, error: error.message });
    });

    // User status event handlers
    socket.on('user_online', (userData: UserStatus) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(userData.userId, userData);
        return newMap;
      });
    });

    socket.on('user_status_changed', (userData: UserStatus) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        if (userData.isOnline) {
          newMap.set(userData.userId, userData);
        } else {
          newMap.delete(userData.userId);
        }
        return newMap;
      });
    });

    // Typing event handlers
    socket.on('user_typing', (typingData: TypingStatus) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (typingData.isTyping) {
          newMap.set(typingData.userId, typingData);
        } else {
          newMap.delete(typingData.userId);
        }
        return newMap;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, userName, enabled]);

  // Socket utility functions
  const joinConversation = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId: string, message: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {
        conversationId,
        message
      });
    }
  };

  const startTyping = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { conversationId });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { conversationId });
    }
  };

  const markMessagesAsRead = (conversationId: string, messageIds: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_read', {
        conversationId,
        messageIds
      });
    }
  };

  const updateStatus = (status: 'online' | 'offline') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update_status', status);
    }
  };

  // Event subscription functions
  const onNewMessage = (callback: (message: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new_message', callback);
      return () => socketRef.current?.off('new_message', callback);
    }
    return () => {};
  };

  const onMessagesRead = (callback: (data: MessageReadStatus) => void) => {
    if (socketRef.current) {
      socketRef.current.on('messages_read', callback);
      return () => socketRef.current?.off('messages_read', callback);
    }
    return () => {};
  };

  const onUserOnline = (callback: (userData: UserStatus) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user_online', callback);
      return () => socketRef.current?.off('user_online', callback);
    }
    return () => {};
  };

  const onUserTyping = (callback: (typingData: TypingStatus) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user_typing', callback);
      return () => socketRef.current?.off('user_typing', callback);
    }
    return () => {};
  };

  return {
    socket: socketRef.current,
    connected: socketState.connected,
    error: socketState.error,
    onlineUsers,
    typingUsers,
    
    // Actions
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    updateStatus,
    
    // Event subscriptions
    onNewMessage,
    onMessagesRead,
    onUserOnline,
    onUserTyping,
  };
}