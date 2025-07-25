import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  username?: string;
  location?: string;
  avatar?: string;
  bio?: string;
  joinedAt: Date;
  lastSeen: Date;
  verified: boolean;
}

/**
 * Get a consistent display name for a user
 * Priority: username > displayName > email prefix
 */
export function getUserDisplayName(user: User | null, profile?: UserProfile | null): string {
  if (!user) return 'Unknown User';
  
  if (profile?.username && profile.username.trim() !== '') {
    return profile.username;
  }
  
  if (user.displayName && user.displayName.trim() !== '') {
    return user.displayName;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Unknown User';
}

/**
 * Get or create user profile in Firestore
 */
export async function getUserProfile(user: User): Promise<UserProfile | null> {
  try {
    const profileRef = doc(db, 'userProfiles', user.uid);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        uid: user.uid,
        displayName: data.displayName || user.displayName || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || '',
        username: data.username,
        location: data.location,
        avatar: data.avatar || user.photoURL,
        bio: data.bio,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        lastSeen: new Date(),
        verified: data.verified || false
      };
    } else {
      // Create new profile
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || '',
        location: '',
        avatar: user.photoURL || '',
        bio: '',
        joinedAt: new Date(),
        lastSeen: new Date(),
        verified: false
      };
      
      await setDoc(profileRef, {
        ...newProfile,
        joinedAt: new Date(),
        lastSeen: new Date()
      });
      
      return newProfile;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string, 
  updates: Partial<Omit<UserProfile, 'uid' | 'joinedAt'>>
): Promise<boolean> {
  try {
    const profileRef = doc(db, 'userProfiles', uid);
    await updateDoc(profileRef, {
      ...updates,
      lastSeen: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get user's current location
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}