import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth'
import { auth } from '@/app/firebase'
import { createNotification } from './firebase-utils'
import { AuthPerformanceMonitor } from './auth-performance'

const monitor = AuthPerformanceMonitor.getInstance()

/**
 * Optimized sign-in with performance monitoring and non-blocking notifications
 */
export async function signInOptimized(email: string, password: string) {
  return monitor.measureSignIn(async () => {
    console.log('🔑 Starting optimized sign-in...')
    
    // Perform authentication
    const result = await signInWithEmailAndPassword(auth, email, password)
    
    // Create notification asynchronously (non-blocking)
    if (result.user) {
      // Don't await the notification - let it run in background
      createNotification({
        type: 'system',
        title: 'Welcome back!',
        message: `Welcome to Local Marketplace, ${result.user.email || 'User'}!`,
        userId: result.user.uid
      }).catch(error => {
        // Silently handle notification errors
        console.warn('Background notification failed:', error)
      })
      
      console.log('✅ Sign-in successful (notification queued)')
    }
    
    return result
  })
}

/**
 * Optimized sign-up with performance monitoring and non-blocking operations
 */
export async function signUpOptimized(email: string, password: string, userData: {
  firstName: string
  lastName: string
}) {
  return monitor.measureSignUp(async () => {
    console.log('👤 Starting optimized sign-up...')
    
    // Perform authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Queue non-blocking operations
    const asyncOperations = [
      // Create notification (non-blocking)
      createNotification({
        type: 'system',
        title: 'Welcome to Local Marketplace!',
        message: `Your account has been created successfully, ${userData.firstName}!`,
        userId: userCredential.user.uid
      }).catch(error => {
        console.warn('Background notification failed:', error)
      })
    ]
    
    // Don't wait for async operations to complete
    Promise.all(asyncOperations).catch(error => {
      console.warn('Some background operations failed:', error)
    })
    
    console.log('✅ Sign-up successful (background operations queued)')
    
    return userCredential
  })
}

/**
 * Optimized Google sign-in
 */
export async function signInWithGoogle() {
  return monitor.measureSignIn(async () => {
    console.log('🔍 Starting Google sign-in...')
    
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    
    // Queue notification asynchronously
    if (result.user) {
      createNotification({
        type: 'system',
        title: 'Welcome back!',
        message: `Welcome to Local Marketplace, ${result.user.displayName || 'User'}!`,
        userId: result.user.uid
      }).catch(error => {
        console.warn('Background notification failed:', error)
      })
      
      console.log('✅ Google sign-in successful (notification queued)')
    }
    
    return result
  })
}

/**
 * Optimized sign-up with Google
 */
export async function signUpWithGoogle() {
  return monitor.measureSignUp(async () => {
    console.log('🔍 Starting Google sign-up...')
    
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    
    // Queue notification asynchronously
    if (result.user) {
      createNotification({
        type: 'system',
        title: 'Welcome to Local Marketplace!',
        message: `Your account has been created successfully, ${result.user.displayName || 'User'}!`,
        userId: result.user.uid
      }).catch(error => {
        console.warn('Background notification failed:', error)
      })
      
      console.log('✅ Google sign-up successful (notification queued)')
    }
    
    return result
  })
}

/**
 * Optimized sign-out
 */
export async function signOutOptimized() {
  const startTime = performance.now()
  
  try {
    await firebaseSignOut(auth)
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    console.log(`👋 Sign-out completed in: ${duration.toFixed(2)}ms`)
    
    // Clear any local storage or session data
    localStorage.removeItem('isLoggedIn')
    
    return true
  } catch (error) {
    console.error('❌ Sign-out failed:', error)
    throw error
  }
}

/**
 * Check authentication state with timeout
 */
export async function checkAuthState(timeout: number = 5000): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Auth state check timed out after ${timeout}ms`))
    }, timeout)
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      clearTimeout(timeoutId)
      unsubscribe()
      resolve(user)
    })
  })
}

/**
 * Preload Firebase Auth to reduce initial delay
 */
export function preloadAuth() {
  console.log('🚀 Preloading Firebase Auth...')
  
  // Trigger auth state initialization
  const unsubscribe = auth.onAuthStateChanged(() => {
    console.log('✅ Firebase Auth preloaded')
    unsubscribe()
  })
}

/**
 * Get authentication performance metrics
 */
export function getAuthMetrics() {
  return monitor.getStats()
}

/**
 * Log authentication performance summary
 */
export function logAuthPerformance() {
  monitor.logPerformanceSummary()
}
