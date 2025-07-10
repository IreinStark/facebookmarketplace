const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Store active users and their socket connections
const activeUsers = new Map();
const conversationRooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user authentication and join
    socket.on('join', (userData) => {
      const { userId, userName } = userData;
      
      // Store user information
      activeUsers.set(userId, {
        socketId: socket.id,
        userName,
        isOnline: true
      });
      
      socket.userId = userId;
      socket.userName = userName;
      
      console.log(`User ${userName} (${userId}) joined`);
      
      // Notify other users that this user is online
      socket.broadcast.emit('user_online', {
        userId,
        userName,
        isOnline: true
      });
    });

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      
      // Track which conversations this socket is in
      if (!socket.conversations) {
        socket.conversations = new Set();
      }
      socket.conversations.add(conversationId);
      
      // Add user to conversation room tracking
      if (!conversationRooms.has(conversationId)) {
        conversationRooms.set(conversationId, new Set());
      }
      conversationRooms.get(conversationId).add(socket.userId);
      
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      
      if (socket.conversations) {
        socket.conversations.delete(conversationId);
      }
      
      // Remove user from conversation room tracking
      if (conversationRooms.has(conversationId)) {
        conversationRooms.get(conversationId).delete(socket.userId);
        if (conversationRooms.get(conversationId).size === 0) {
          conversationRooms.delete(conversationId);
        }
      }
      
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle real-time message sending
    socket.on('send_message', (messageData) => {
      const { conversationId, message } = messageData;
      
      // Broadcast the message to all users in the conversation except sender
      socket.to(conversationId).emit('new_message', {
        ...message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Message sent in conversation ${conversationId} by ${socket.userId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: false
      });
    });

    // Handle message read receipts
    socket.on('mark_read', (data) => {
      const { conversationId, messageIds } = data;
      
      // Notify other users in the conversation that messages were read
      socket.to(conversationId).emit('messages_read', {
        conversationId,
        messageIds,
        readBy: socket.userId
      });
    });

    // Handle user status updates (online/offline)
    socket.on('update_status', (status) => {
      if (activeUsers.has(socket.userId)) {
        const userData = activeUsers.get(socket.userId);
        userData.isOnline = status === 'online';
        
        // Broadcast status update to all connected users
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          isOnline: userData.isOnline
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.userId) {
        // Update user as offline
        if (activeUsers.has(socket.userId)) {
          const userData = activeUsers.get(socket.userId);
          userData.isOnline = false;
          
          // Notify other users that this user went offline
          socket.broadcast.emit('user_online', {
            userId: socket.userId,
            userName: userData.userName,
            isOnline: false
          });
        }
        
        // Clean up conversation room tracking
        if (socket.conversations) {
          socket.conversations.forEach(conversationId => {
            if (conversationRooms.has(conversationId)) {
              conversationRooms.get(conversationId).delete(socket.userId);
              if (conversationRooms.get(conversationId).size === 0) {
                conversationRooms.delete(conversationId);
              }
            }
          });
        }
        
        // Remove user after a delay (in case they reconnect quickly)
        setTimeout(() => {
          if (activeUsers.has(socket.userId)) {
            const userData = activeUsers.get(socket.userId);
            if (userData.socketId === socket.id) {
              activeUsers.delete(socket.userId);
            }
          }
        }, 5000); // 5 second delay
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Start the server
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Socket.io server is running');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      console.log('Process terminated');
    });
  });
});

module.exports = { activeUsers, conversationRooms };