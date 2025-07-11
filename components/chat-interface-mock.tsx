"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { PhotoUploadMock } from './photo-upload-mock';
import { 
  Send, 
  User, 
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Search,
  ArrowLeft,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';

// Mock interfaces matching Firebase types
interface MockConversation {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: { [userId: string]: number };
  productId?: string;
  productTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
  photoUrl?: string;
  read: boolean;
}

interface ChatInterfaceProps {
  currentUserId: string;
  currentUserName: string;
  isOpen: boolean;
  onClose: () => void;
  initialConversationId?: string;
  initialRecipientId?: string;
  initialRecipientName?: string;
  productId?: string;
  productTitle?: string;
}

// Global storage for mock data (in a real app, this would be in context or state management)
let mockConversations: MockConversation[] = [];
let mockMessages: MockMessage[] = [];

export function ChatInterfaceMock({
  currentUserId,
  currentUserName,
  isOpen,
  onClose,
  initialConversationId,
  initialRecipientId,
  initialRecipientName,
  productId,
  productTitle
}: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<MockConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationsList, setShowConversationsList] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationsList(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto hide conversations list on mobile when conversation is selected
  useEffect(() => {
    if (isMobile && selectedConversation) {
      setShowConversationsList(false);
    }
  }, [isMobile, selectedConversation]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mock conversation creation
  const createMockConversation = (
    participants: string[],
    participantNames: { [userId: string]: string },
    productId?: string,
    productTitle?: string
  ): MockConversation => {
    // Check if conversation already exists
    const existingConv = mockConversations.find(conv => 
      conv.participants.length === participants.length && 
      participants.every(p => conv.participants.includes(p)) &&
      conv.productId === productId
    );
    
    if (existingConv) return existingConv;

    const newConv: MockConversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      participants,
      participantNames,
      unreadCount: participants.reduce((acc, userId) => {
        acc[userId] = 0;
        return acc;
      }, {} as { [userId: string]: number }),
      productId,
      productTitle,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockConversations.push(newConv);
    return newConv;
  };

  // Mock message sending
  const sendMockMessage = (
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: 'text' | 'image' = 'text',
    photoUrl?: string
  ): MockMessage => {
    const newMessage: MockMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId,
      senderName,
      content,
      timestamp: new Date(),
      type,
      photoUrl,
      read: false
    };

    mockMessages.push(newMessage);

    // Update conversation
    const convIndex = mockConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      mockConversations[convIndex] = {
        ...mockConversations[convIndex],
        lastMessage: content,
        lastMessageTime: new Date(),
        updatedAt: new Date()
      };
    }

    return newMessage;
  };

  // Initialize conversation if recipient is provided
  useEffect(() => {
    if (initialRecipientId && initialRecipientName && !initialConversationId) {
      const conversation = createMockConversation(
        [currentUserId, initialRecipientId],
        {
          [currentUserId]: currentUserName,
          [initialRecipientId]: initialRecipientName
        },
        productId,
        productTitle
      );
      setSelectedConversation(conversation.id);
    }
  }, [initialRecipientId, initialRecipientName, currentUserId, currentUserName, productId, productTitle, initialConversationId]);

  // Load conversations on open
  useEffect(() => {
    if (!isOpen) return;

    const userConversations = mockConversations.filter(conv => 
      conv.participants.includes(currentUserId)
    ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    setConversations(userConversations);
  }, [isOpen, currentUserId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const conversationMessages = mockMessages
      .filter(msg => msg.conversationId === selectedConversation)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    setMessages(conversationMessages);
    scrollToBottom();
  }, [selectedConversation]);

  // Auto-refresh conversations and messages (simulate real-time)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // Refresh conversations
      const userConversations = mockConversations.filter(conv => 
        conv.participants.includes(currentUserId)
      ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setConversations(userConversations);

      // Refresh messages if conversation is selected
      if (selectedConversation) {
        const conversationMessages = mockMessages
          .filter(msg => msg.conversationId === selectedConversation)
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setMessages(conversationMessages);
        scrollToBottom();
      }
    }, 1000); // Check for updates every second

    return () => clearInterval(interval);
  }, [isOpen, currentUserId, selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      sendMockMessage(
        selectedConversation,
        currentUserId,
        currentUserName,
        newMessage.trim()
      );
      setNewMessage('');
      
      // Simulate some delay for realism
      setTimeout(() => {
        setLoading(false);
      }, 200);
    } catch (error) {
      console.error('Failed to send message:', error);
      setLoading(false);
    }
  };

  const handleSendPhoto = async (photos: any[]) => {
    if (photos.length === 0 || !selectedConversation) return;

    setLoading(true);
    try {
      for (const photo of photos) {
        sendMockMessage(
          selectedConversation,
          currentUserId,
          currentUserName,
          'Photo',
          'image',
          photo.url
        );
      }
      setShowPhotoUpload(false);
      
      setTimeout(() => {
        setLoading(false);
      }, 200);
    } catch (error) {
      console.error('Failed to send photo:', error);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToConversations = () => {
    setShowConversationsList(true);
    if (isMobile) {
      setSelectedConversation(null);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (isMobile) {
      setShowConversationsList(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const otherParticipantName = Object.entries(conv.participantNames)
      .find(([id]) => id !== currentUserId)?.[1] || '';
    return (
      otherParticipantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);
  const otherParticipant = selectedConv ? 
    Object.entries(selectedConv.participantNames).find(([id]) => id !== currentUserId) : null;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] md:h-[80vh] p-0 w-[95vw] md:w-full">
        <DialogHeader className="p-3 sm:p-4 border-b">
          <DialogTitle className="text-base sm:text-lg">
            Messages 
            <span className="text-sm text-gray-500 ml-2">(Demo Mode)</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full relative">
          {/* Conversations List */}
          <div className={`
            ${isMobile 
              ? (showConversationsList 
                  ? 'w-full' 
                  : 'hidden'
                ) 
              : 'w-full md:w-1/3'
            } 
            border-r flex flex-col ${isMobile ? 'absolute inset-0 bg-background z-10' : ''}
          `}>
            {/* Search */}
            <div className="p-3 sm:p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1 sm:space-y-2">
                {filteredConversations.map((conversation) => {
                  const otherParticipantEntry = Object.entries(conversation.participantNames)
                    .find(([id]) => id !== currentUserId);
                  const otherParticipantName = otherParticipantEntry?.[1] || 'Unknown';

                  return (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors touch-manipulation ${
                        selectedConversation === conversation.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                            <AvatarFallback className="text-xs sm:text-sm">
                              {otherParticipantName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm sm:text-base truncate">{otherParticipantName}</h4>
                              {conversation.lastMessageTime && (
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {format(conversation.lastMessageTime, 'MMM d')}
                                </span>
                              )}
                            </div>
                            
                            {conversation.productTitle && (
                              <p className="text-xs text-blue-600 truncate">
                                About: {conversation.productTitle}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs sm:text-sm text-gray-500 truncate">
                                {conversation.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No conversations found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`
            ${isMobile 
              ? (!showConversationsList 
                  ? 'w-full' 
                  : 'hidden'
                ) 
              : 'flex-1'
            } 
            flex flex-col ${isMobile ? 'absolute inset-0 bg-background' : ''}
          `}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      {isMobile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToConversations}
                          className="p-1 h-8 w-8 flex-shrink-0"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarFallback className="text-xs sm:text-sm">
                          {otherParticipant?.[1]?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">{otherParticipant?.[1] || 'Unknown'}</h3>
                        {selectedConv?.productTitle && (
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            About: {selectedConv.productTitle}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden sm:flex">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden sm:flex">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-2 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${
                            message.senderId === currentUserId
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          {message.type === 'image' && message.photoUrl ? (
                            <div className="space-y-2">
                              <img
                                src={message.photoUrl}
                                alt="Shared photo"
                                className="rounded max-w-full h-auto cursor-pointer"
                                onClick={() => window.open(message.photoUrl, '_blank')}
                              />
                              {message.content !== 'Photo' && (
                                <p className="text-xs sm:text-sm">{message.content}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-1 space-x-2">
                            <span className="text-xs opacity-70 flex-shrink-0">
                              {format(message.timestamp, 'h:mm a')}
                            </span>
                            {message.senderId === currentUserId && (
                              <span className="text-xs opacity-70 flex-shrink-0">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-2 sm:p-4 border-t">
                  <div className="flex items-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPhotoUpload(true)}
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0 touch-manipulation"
                      title="Send photo"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                        className="resize-none min-h-[36px] sm:min-h-[40px] max-h-32 text-sm sm:text-base py-2 sm:py-2"
                      />
                    </div>
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || loading}
                      size="sm"
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0 touch-manipulation"
                      title="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
                <div className="text-center max-w-sm">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">Select a conversation to start messaging</p>
                  <p className="text-xs mt-2 opacity-70">Demo mode - messages stored locally</p>
                  {isMobile && (
                    <Button
                      variant="outline"
                      onClick={() => setShowConversationsList(true)}
                      className="mt-4"
                      size="sm"
                    >
                      View Conversations
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photo Upload Dialog */}
        {showPhotoUpload && (
          <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
            <DialogContent className="max-w-md w-[90vw] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Send Photos</DialogTitle>
              </DialogHeader>
              <PhotoUploadMock
                onPhotosUploaded={handleSendPhoto}
                userId={currentUserId}
                maxFiles={3}
              />
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}