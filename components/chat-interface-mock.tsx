"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { PhotoUpload } from './photo-upload';
import { 
  Send, 
  User, 
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Search
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Messages (Demo Mode)</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => {
                  const otherParticipantEntry = Object.entries(conversation.participantNames)
                    .find(([id]) => id !== currentUserId);
                  const otherParticipantName = otherParticipantEntry?.[1] || 'Unknown';

                  return (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedConversation === conversation.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {otherParticipantName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">{otherParticipantName}</h4>
                              {conversation.lastMessageTime && (
                                <span className="text-xs text-gray-500">
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
                              <p className="text-sm text-gray-500 truncate">
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
                    <p>No conversations found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {otherParticipant?.[1]?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{otherParticipant?.[1] || 'Unknown'}</h3>
                        {selectedConv?.productTitle && (
                          <p className="text-sm text-gray-500">
                            About: {selectedConv.productTitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
                                className="rounded max-w-full h-auto"
                              />
                              {message.content !== 'Photo' && (
                                <p className="text-sm">{message.content}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                              {format(message.timestamp, 'h:mm a')}
                            </span>
                            {message.senderId === currentUserId && (
                              <span className="text-xs opacity-70">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPhotoUpload(true)}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                        className="resize-none min-h-[40px] max-h-32"
                      />
                    </div>
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || loading}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                  <p className="text-xs mt-2 opacity-70">Demo mode - messages stored locally</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photo Upload Dialog */}
        {showPhotoUpload && (
          <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send Photos</DialogTitle>
              </DialogHeader>
              <PhotoUpload
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