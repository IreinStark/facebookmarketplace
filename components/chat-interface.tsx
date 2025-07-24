"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  createConversation, 
  sendMessage,
  subscribeToMessages, 
  subscribeToConversations,
  markMessagesAsRead,
  type Conversation, 
  type Message, 
  type Photo 
} from '../lib/firebase-utils';
import { PhotoUpload } from './photo-upload';
import { 
  Send, 
  Image as ImageIcon, 
  User, 
  Clock,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  X,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

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

export function ChatInterface({
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeConversations = useRef<(() => void) | null>(null);
  const unsubscribeMessages = useRef<(() => void) | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize conversation if recipient is provided
  useEffect(() => {
    if (initialRecipientId && initialRecipientName && !initialConversationId) {
      const initializeConversation = async () => {
        try {
          const conversation = await createConversation(
            [currentUserId, initialRecipientId],
            {
              [currentUserId]: currentUserName,
              [initialRecipientId]: initialRecipientName
            },
            productId,
            productTitle
          );
          setSelectedConversation(conversation.id);
        } catch (error) {
          console.error('Failed to create conversation:', error);
        }
      };
      initializeConversation();
    }
  }, [initialRecipientId, initialRecipientName, currentUserId, currentUserName, productId, productTitle, initialConversationId]);

  // Subscribe to conversations
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = subscribeToConversations(currentUserId, (newConversations) => {
      setConversations(newConversations);
    });

    unsubscribeConversations.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [currentUserId, isOpen]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = subscribeToMessages(selectedConversation, (newMessages) => {
      setMessages(newMessages);
      scrollToBottom();
    });

    unsubscribeMessages.current = unsubscribe;

    // Mark messages as read
    markMessagesAsRead(selectedConversation, currentUserId);

    return () => {
      unsubscribe();
    };
  }, [selectedConversation, currentUserId]);

  // Cleanup subscriptions
  useEffect(() => {
    return () => {
      unsubscribeConversations.current?.();
      unsubscribeMessages.current?.();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      await sendMessage(
        selectedConversation,
        currentUserId,
        currentUserName,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoto = async (photos: Photo[]) => {
    if (photos.length === 0 || !selectedConversation) return;

    setLoading(true);
    try {
      for (const photo of photos) {
        await sendMessage(
          selectedConversation,
          currentUserId,
          currentUserName,
          'Photo',
          'image',
          photo.url
        );
      }
      setShowPhotoUpload(false);
    } catch (error) {
      console.error('Failed to send photo:', error);
    } finally {
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
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Messages</DialogTitle>
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
            <ScrollArea className="flex-1 overflow-y-auto h-full px-6 py-4">
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => {
                  const otherParticipantEntry = Object.entries(conversation.participantNames)
                    .find(([id]) => id !== currentUserId);
                  const otherParticipantName = otherParticipantEntry?.[1] || 'Unknown';
                  const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

                  return (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer transition-colors rounded-md p-2 ${
                        selectedConversation === conversation.id
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                         : 'hover:bg-muted dark:hover:bg-gray-800'
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
                              {conversation.lastMessageTime ? (
                                <span className="text-xs text-gray-500">
                                  {(() => {
                                    try {
                                      return format(conversation.lastMessageTime.toDate(), 'MMM d');
                                    } catch (error) {
                                      console.warn('Error formatting conversation date:', error);
                                      return 'Recent';
                                    }
                                  })()}
                                </span>
                                ) : null}

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
                                                                                                                           {unreadCount > 0 && (
                                 <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-xs font-medium text-white bg-red-500 rounded-full">
                                   {unreadCount}
                                 </span>
                               )}
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
          <div className="flex-1 flex flex-col overflow hidd">
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
                <ScrollArea className="flex-1 px-6 py-6 space-y-4">
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
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-none'
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
                              {message.timestamp ? (() => {
                                try {
                                  return format(message.timestamp.toDate(), 'h:mm a');
                                } catch (error) {
                                  console.warn('Error formatting message timestamp:', error);
                                  return '...';
                                }
                              })() : '...'}
                            </span>
                            {message.senderId === currentUserId && (
                              <span className="text-xs opacity-70">
                                {message.read ? '✓✓' : '✓'}
                              </span>
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
                         className="resize-none min-h-[40px] max-h-32 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500"
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