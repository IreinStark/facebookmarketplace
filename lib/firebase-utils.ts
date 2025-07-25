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
  DocumentData,
  FieldValue
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage, auth } from '../app/firebase';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from "firebase/auth";

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
export async function getPhotosByProduct(productId: string): Promise<Photo[]> {
  try {
    const q = query(
      collection(db, 'photos'),
      where('productId', '==', productId),
      orderBy('uploadedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Photo));
  } catch (error) {
    console.error('Error fetching product photos:', error);
    return [];
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
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp 
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

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string,
  type: 'text' | 'image' = 'text',
  photoUrl?: string
): Promise<void> {
  try {
    const messageData = {
      conversationId,
      senderId,
      senderName,
      content,
      timestamp: serverTimestamp(),
      type,
      photoUrl: photoUrl || null,
      read: false,
    };

    await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      messageData
    );

    // Update conversation metadata
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: type === 'image' ? 'Photo' : content,
      lastMessageTime: serverTimestamp(),
      [`unreadCount.${senderId}`]: 0, // reset sender's unread
      // Increment unread for others (you can adjust this for more than 2 users)
      [`unreadCount`]: {
        [senderId]: 0 // default fallback
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
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
  seller?: string;
  sellerProfile?: {
    uid: string;
    displayName: string;
    username?: string;
    avatar?: string;
    verified: boolean;
  } | null;
  createdAt: Timestamp;
}

// Helper function to remove undefined values from an object
function removeUndefinedValues(obj: any): any {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const cleanedNested = removeUndefinedValues(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  try {
    // Clean the data to remove undefined values
    const cleanData = removeUndefinedValues({
      ...productData,
      createdAt: serverTimestamp(),
    });
    
    console.log('Creating product with data:', cleanData);
    
    const docRef = await addDoc(collection(db, 'products'), cleanData);
    console.log('Product created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
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
    console.log('Firebase snapshot received:', snapshot.size, 'documents');
    const products = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      console.log('Product document:', doc.id, data);
      return {
        id: doc.id,
        ...data
      } as Product;
    });
    console.log('Processed products for callback:', products.length, 'products');
    callback(products);
  }, (error) => {
    console.error('Error in subscribeToProducts:', error);
    console.error('Error details:', error.code, error.message);
    callback([]); // Return empty array on error
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



export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}
