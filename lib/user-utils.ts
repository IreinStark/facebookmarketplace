import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";

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

/**
 * Find the closest location from a list of predefined locations
 */
export function findClosestLocation(
  userLat: number, 
  userLng: number, 
  locationData: Array<{ name: string; lat: number; lng: number; region: string }>
): { name: string; lat: number; lng: number; region: string } {
  let minDistance = Infinity
  let closestLocation = locationData[0]
  
  locationData.forEach(location => {
    const distance = Math.sqrt(
      Math.pow(userLat - location.lat, 2) + 
      Math.pow(userLng - location.lng, 2)
    )
    if (distance < minDistance) {
      minDistance = distance
      closestLocation = location
    }
  })
  
  return closestLocation
}

/**
 * Get location error message based on error code
 */
export function getLocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access denied. Please enable location permissions."
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable."
    case error.TIMEOUT:
      return "Location request timed out."
    default:
      return "Unable to retrieve your location."
  }
}