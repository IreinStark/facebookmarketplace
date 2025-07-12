import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../app/firebase';
import { v4 as uuidv4 } from 'uuid';

// Types for our data structures
export interface Photo {
  id: string;
  url: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  productId?: string;
  metadata?: {
    size: number;
    type: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    radius: number;
  };
}

export interface Conversation {
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

export interface Message {
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

// Photo Management Functions
export async function uploadPhoto(
  file: File, 
  uploadedBy: string, 
  productId?: string,
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    radius: number;
  }
): Promise<Photo> {
  try {
    const photoId = uuidv4();
    const filename = `${photoId}_${file.name}`;
    const storageRef = ref(storage, `photos/${filename}`);
    
    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Create photo document in Firestore
    const photoData: Omit<Photo, 'id'> = {
      url: downloadURL,
      filename,
      uploadedBy,
      uploadedAt: serverTimestamp() as Timestamp,
      productId,
      metadata: {
        size: file.size,
        type: file.type
      },
      location
    };
    
    const docRef = await addDoc(collection(db, 'photos'), photoData);
    
    return {
      id: docRef.id,
      ...photoData,
      uploadedAt: Timestamp.now()
    } as Photo;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo');
  }
}

export async function deletePhoto(photoId: string): Promise<void> {
  try {
    const photoDoc = await getDoc(doc(db, 'photos', photoId));
    if (photoDoc.exists()) {
      const photoData = photoDoc.data() as Photo;
      
      // Delete from Storage
      const storageRef = ref(storage, `photos/${photoData.filename}`);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'photos', photoId));
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw new Error('Failed to delete photo');
  }
}

export async function getPhotosByUser(userId: string): Promise<Photo[]> {
  try {
    const q = query(
      collection(db, 'photos'),
      where('uploadedBy', '==', userId),
      orderBy('uploadedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Photo));
  } catch (error) {
    console.error('Error fetching user photos:', error);
    return [];
  }
}

// Conversation Management Functions
export async function createConversation(
  participants: string[],
  participantNames: { [userId: string]: string },
  productId?: string,
  productTitle?: string
): Promise<Conversation> {
  try {
    // Check if conversation already exists between these participants
    const existingConv = await findExistingConversation(participants, productId);
    if (existingConv) {
      return existingConv;
    }
    
    const conversationData: Omit<Conversation, 'id'> = {
      participants,
      participantNames,
      unreadCount: participants.reduce((acc, userId) => {
        acc[userId] = 0;
        return acc;
      }, {} as { [userId: string]: number }),
      productId,
      productTitle,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };
    
    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    
    return {
      id: docRef.id,
      ...conversationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    } as Conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
}

export async function findExistingConversation(
  participants: string[], 
  productId?: string
): Promise<Conversation | null> {
  try {
    let q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', participants[0])
    );
    
    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
    
    // Filter to find exact participant match and product match if provided
    return conversations.find((conv: Conversation) => {
      const sameParticipants = conv.participants.length === participants.length && 
        participants.every(p => conv.participants.includes(p));
      const sameProduct = productId ? conv.productId === productId : true;
      return sameParticipants && sameProduct;
    }) || null;
  } catch (error) {
    console.error('Error finding existing conversation:', error);
    return null;
  }
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    return [];
  }
}

// Message Management Functions
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string,
  type: 'text' | 'image' = 'text',
  photoUrl?: string
): Promise<Message> {
  try {
    const batch = writeBatch(db);
    
    // Create message
    const messageData: Omit<Message, 'id'> = {
      conversationId,
      senderId,
      senderName,
      content,
      timestamp: serverTimestamp() as Timestamp,
      type,
      photoUrl,
      read: false
    };
    
    const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
    batch.set(messageRef, messageData);
    
    // Update conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    
    return {
      id: messageRef.id,
      ...messageData,
      timestamp: Timestamp.now()
    } as Message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    callback(messages);
  });
}

export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
    callback(conversations);
  });
}

export async function markMessagesAsRead(
  conversationId: string, 
  userId: string
): Promise<void> {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      batch.update(doc.ref, { read: true });
    });
    
    // Reset unread count for this user
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

// Product Management Functions
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  isNegotiable: boolean;
  image: string;
  photos?: {
    id: string;
    url: string;
    filename: string;
  }[];
  userId: string;
  createdAt: Timestamp;
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const q = query(
    collection(db, 'products'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    callback(products);
  });
}

export async function getUserById(userId: string): Promise<{displayName: string} | null> {
  try {
    // For now, return a placeholder since we don't have a users collection
    // In production, you'd fetch from a users collection
    return { displayName: 'Anonymous User' };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}