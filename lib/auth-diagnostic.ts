import { auth } from '@/app/firebase';
import { testFirebaseConnection, diagnoseAuthDelays } from './auth-performance';

/**
 * Comprehensive authentication diagnostic tool
 */
export class AuthDiagnostic {
  private static instance: AuthDiagnostic;
  private results: {
    network: boolean;
    firebaseConfig: boolean;
    authInit: boolean;
    performance: any;
    recommendations: string[];
  } = {
    network: false,
    firebaseConfig: false,
    authInit: false,
    performance: null,
    recommendations: []
  };

  static getInstance(): AuthDiagnostic {
    if (!AuthDiagnostic.instance) {
      AuthDiagnostic.instance = new AuthDiagnostic();
    }
    return AuthDiagnostic.instance;
  }

  /**
   * Run complete diagnostic
   */
  async runFullDiagnostic(): Promise<void> {
    console.group('🔍 Running Authentication Diagnostic...');
    
    await this.checkNetworkConnectivity();
    await this.checkFirebaseConfiguration();
    await this.checkAuthInitialization();
    await this.measurePerformance();
    this.generateRecommendations();
    
    this.displayResults();
    console.groupEnd();
  }

  /**
   * Check network connectivity to Firebase
   */
  private async checkNetworkConnectivity(): Promise<void> {
    console.log('🌐 Checking network connectivity...');
    
    try {
      // Test connection to Firebase servers
      const response = await fetch('https://firebase.googleapis.com', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      this.results.network = true;
      console.log('✅ Network connectivity: OK');
    } catch (error) {
      this.results.network = false;
      console.error('❌ Network connectivity: FAILED', error);
      this.results.recommendations.push('Check internet connection');
      this.results.recommendations.push('Verify firewall/proxy settings');
    }
  }

  /**
   * Check Firebase configuration
   */
  private async checkFirebaseConfiguration(): Promise<void> {
    console.log('⚙️ Checking Firebase configuration...');
    
    try {
      // Check if Firebase config exists
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      // Check app configuration
      const app = auth.app;
      const config = app.options;
      
      if (!config.apiKey || !config.authDomain || !config.projectId) {
        throw new Error('Invalid Firebase configuration');
      }

      this.results.firebaseConfig = true;
      console.log('✅ Firebase configuration: OK');
      console.log('📋 Project ID:', config.projectId);
      console.log('📋 Auth Domain:', config.authDomain);
    } catch (error) {
      this.results.firebaseConfig = false;
      console.error('❌ Firebase configuration: FAILED', error);
      this.results.recommendations.push('Verify firebase.ts configuration');
      this.results.recommendations.push('Check environment variables');
    }
  }

  /**
   * Check Auth initialization
   */
  private async checkAuthInitialization(): Promise<void> {
    console.log('🔐 Checking Auth initialization...');
    
    try {
      // Test auth state change
      const startTime = performance.now();
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Auth initialization timeout'));
        }, 5000);

        const unsubscribe = auth.onAuthStateChanged((user) => {
          clearTimeout(timeout);
          unsubscribe();
          
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          console.log(`⏱️ Auth initialization took: ${duration.toFixed(2)}ms`);
          
          if (duration > 2000) {
            this.results.recommendations.push('Auth initialization is slow - consider preloading');
          }
          
          resolve();
        });
      });

      this.results.authInit = true;
      console.log('✅ Auth initialization: OK');
    } catch (error) {
      this.results.authInit = false;
      console.error('❌ Auth initialization: FAILED', error);
      this.results.recommendations.push('Firebase Auth failed to initialize');
      this.results.recommendations.push('Check Firebase project settings');
    }
  }

  /**
   * Measure authentication performance
   */
  private async measurePerformance(): Promise<void> {
    console.log('📊 Measuring performance...');
    
    try {
      await testFirebaseConnection();
      diagnoseAuthDelays();
      
      this.results.performance = 'Measured';
      console.log('✅ Performance measurement: OK');
    } catch (error) {
      this.results.performance = 'Failed';
      console.error('❌ Performance measurement: FAILED', error);
    }
  }

  /**
   * Generate recommendations based on results
   */
  private generateRecommendations(): void {
    console.log('💡 Generating recommendations...');
    
    // Network recommendations
    if (!this.results.network) {
      this.results.recommendations.push('Poor network connectivity detected');
      this.results.recommendations.push('Consider using Firebase Emulator for development');
    }

    // Configuration recommendations
    if (!this.results.firebaseConfig) {
      this.results.recommendations.push('Invalid Firebase configuration');
      this.results.recommendations.push('Check firebase.ts file');
    }

    // Auth recommendations
    if (!this.results.authInit) {
      this.results.recommendations.push('Auth initialization failed');
      this.results.recommendations.push('Check Firebase project region');
      this.results.recommendations.push('Verify API keys are correct');
    }

    // Performance recommendations
    if (this.results.performance === 'Failed') {
      this.results.recommendations.push('Performance issues detected');
      this.results.recommendations.push('Consider using optimized auth functions');
    }

    // General recommendations
    this.results.recommendations.push('Use AuthGateOptimized for better UX');
    this.results.recommendations.push('Implement non-blocking notifications');
    this.results.recommendations.push('Add performance monitoring in production');
  }

  /**
   * Display diagnostic results
   */
  private displayResults(): void {
    console.log('\n📋 DIAGNOSTIC RESULTS:');
    console.table({
      'Network': this.results.network ? '✅ PASS' : '❌ FAIL',
      'Firebase Config': this.results.firebaseConfig ? '✅ PASS' : '❌ FAIL',
      'Auth Init': this.results.authInit ? '✅ PASS' : '❌ FAIL',
      'Performance': this.results.performance
    });

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    } else {
      console.log('\n✅ No issues detected!');
    }
  }

  /**
   * Get specific delay causes
   */
  getDelayCauses(): string[] {
    const causes: string[] = [];
    
    if (!this.results.network) causes.push('Network connectivity issues');
    if (!this.results.firebaseConfig) causes.push('Firebase configuration problems');
    if (!this.results.authInit) causes.push('Auth initialization delays');
    if (this.results.performance === 'Failed') causes.push('Performance bottlenecks');
    
    return causes;
  }

  /**
   * Get quick fix suggestions
   */
  getQuickFixes(): string[] {
    const fixes: string[] = [];
    
    if (!this.results.network) {
      fixes.push('Check internet connection');
      fixes.push('Try different network');
    }
    
    if (!this.results.authInit) {
      fixes.push('Refresh the page');
      fixes.push('Clear browser cache');
      fixes.push('Check Firebase console');
    }
    
    if (this.results.performance === 'Failed') {
      fixes.push('Use optimized auth functions');
      fixes.push('Enable performance monitoring');
    }
    
    return fixes;
  }
}

/**
 * Quick diagnostic function
 */
export async function quickAuthDiagnostic(): Promise<void> {
  const diagnostic = AuthDiagnostic.getInstance();
  await diagnostic.runFullDiagnostic();
}

/**
 * Get authentication delay causes
 */
export function getAuthDelayCauses(): string[] {
  const diagnostic = AuthDiagnostic.getInstance();
  return diagnostic.getDelayCauses();
}

/**
 * Get quick fixes for auth delays
 */
export function getAuthQuickFixes(): string[] {
  const diagnostic = AuthDiagnostic.getInstance();
  return diagnostic.getQuickFixes();
}
