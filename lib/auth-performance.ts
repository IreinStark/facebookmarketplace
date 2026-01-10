import { auth } from '@/app/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Performance monitoring for authentication operations
 */
export class AuthPerformanceMonitor {
  private static instance: AuthPerformanceMonitor;
  private metrics: {
    authStateChange: number[];
    signIn: number[];
    signUp: number[];
    signOut: number[];
  } = {
    authStateChange: [],
    signIn: [],
    signUp: [],
    signOut: []
  };

  static getInstance(): AuthPerformanceMonitor {
    if (!AuthPerformanceMonitor.instance) {
      AuthPerformanceMonitor.instance = new AuthPerformanceMonitor();
    }
    return AuthPerformanceMonitor.instance;
  }

  /**
   * Monitor auth state changes and measure response time
   */
  monitorAuthState(): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.authStateChange.push(duration);
        console.log(`Auth state change took: ${duration.toFixed(2)}ms`);
        
        // Keep only last 10 measurements
        if (this.metrics.authStateChange.length > 10) {
          this.metrics.authStateChange.shift();
        }
        
        unsubscribe();
        resolve();
      });
    });
  }

  /**
   * Measure sign-in operation performance
   */
  measureSignIn(signInOperation: () => Promise<any>): Promise<any> {
    const startTime = performance.now();
    
    return signInOperation()
      .then(result => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.signIn.push(duration);
        console.log(`Sign-in took: ${duration.toFixed(2)}ms`);
        
        // Keep only last 10 measurements
        if (this.metrics.signIn.length > 10) {
          this.metrics.signIn.shift();
        }
        
        return result;
      })
      .catch(error => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.signIn.push(duration);
        console.log(`Failed sign-in took: ${duration.toFixed(2)}ms`);
        
        throw error;
      });
  }

  /**
   * Measure sign-up operation performance
   */
  measureSignUp(signUpOperation: () => Promise<any>): Promise<any> {
    const startTime = performance.now();
    
    return signUpOperation()
      .then(result => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.signUp.push(duration);
        console.log(`Sign-up took: ${duration.toFixed(2)}ms`);
        
        // Keep only last 10 measurements
        if (this.metrics.signUp.length > 10) {
          this.metrics.signUp.shift();
        }
        
        return result;
      })
      .catch(error => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.signUp.push(duration);
        console.log(`Failed sign-up took: ${duration.toFixed(2)}ms`);
        
        throw error;
      });
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const calculateStats = (values: number[]) => {
      if (values.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
      
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      return { avg, min, max, count: values.length };
    };

    return {
      authStateChange: calculateStats(this.metrics.authStateChange),
      signIn: calculateStats(this.metrics.signIn),
      signUp: calculateStats(this.metrics.signUp),
      signOut: calculateStats(this.metrics.signOut)
    };
  }

  /**
   * Log performance summary
   */
  logPerformanceSummary() {
    const stats = this.getStats();
    
    console.group('🔥 Firebase Auth Performance Summary');
    console.table(stats);
    
    // Identify potential issues
    Object.entries(stats).forEach(([operation, { avg, max, count }]) => {
      if (count > 0) {
        if (avg > 1000) {
          console.warn(`⚠️ ${operation} average is slow: ${avg.toFixed(2)}ms`);
        }
        if (max > 3000) {
          console.warn(`⚠️ ${operation} max is very slow: ${max.toFixed(2)}ms`);
        }
        if (avg < 100) {
          console.log(`✅ ${operation} performance is good: ${avg.toFixed(2)}ms`);
        }
      }
    });
    
    console.groupEnd();
  }
}

/**
 * Test Firebase connection latency
 */
export async function testFirebaseConnection(): Promise<void> {
  console.log('🔍 Testing Firebase connection...');
  
  try {
    const startTime = performance.now();
    
    // Test auth state change (this should be fast)
    await AuthPerformanceMonitor.getInstance().monitorAuthState();
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    console.log(`✅ Firebase connection test completed in: ${totalDuration.toFixed(2)}ms`);
    
    if (totalDuration > 2000) {
      console.warn('⚠️ Firebase connection appears slow');
    } else {
      console.log('✅ Firebase connection latency is acceptable');
    }
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
  }
}

/**
 * Diagnose authentication delays
 */
export function diagnoseAuthDelays() {
  const monitor = AuthPerformanceMonitor.getInstance();
  
  console.group('🔍 Authentication Delay Diagnosis');
  
  // Check if auth is properly initialized
  if (!auth) {
    console.error('❌ Firebase Auth not initialized');
    return;
  }
  
  console.log('✅ Firebase Auth initialized');
  
  // Check current auth state
  const currentUser = auth.currentUser;
  console.log('📊 Current user:', currentUser ? 'Authenticated' : 'Not authenticated');
  
  // Get performance stats
  const stats = monitor.getStats();
  
  // Analyze common issues
  if (stats.authStateChange.count > 0 && stats.authStateChange.avg > 500) {
    console.warn('⚠️ Auth state changes are slow - possible network issues');
  }
  
  if (stats.signIn.count > 0 && stats.signIn.avg > 2000) {
    console.warn('⚠️ Sign-in operations are slow - possible Firebase configuration issues');
  }
  
  if (stats.signUp.count > 0 && stats.signUp.avg > 3000) {
    console.warn('⚠️ Sign-up operations are slow - possible Firestore write delays');
  }
  
  console.log('📈 Performance Summary:');
  console.table(stats);
  
  console.groupEnd();
  
  // Recommendations
  console.group('💡 Recommendations');
  
  if (stats.authStateChange.avg > 500) {
    console.log('• Consider reducing auth state listeners');
    console.log('• Check network connectivity');
    console.log('• Verify Firebase project region');
  }
  
  if (stats.signIn.avg > 2000) {
    console.log('• Check Firebase Auth configuration');
    console.log('• Verify email/password providers are enabled');
    console.log('• Consider using Firebase Emulator for local testing');
  }
  
  if (stats.signUp.avg > 3000) {
    console.log('• Check Firestore rules and indexes');
    console.log('• Verify user profile creation is not blocking');
    console.log('• Consider making notification creation async');
  }
  
  console.groupEnd();
}
