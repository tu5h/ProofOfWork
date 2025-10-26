// Frontend API Client for Backend Integration
// This file connects the frontend to your Node.js backend API

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface LocationVerificationRequest {
  latitude: number;
  longitude: number;
  targetLatitude: number;
  targetLongitude: number;
  radius: number;
}

export interface LocationVerificationResult {
  verified: boolean;
  distance?: number;
  withinRadius?: boolean;
  error?: string;
  proof?: {
    hash: string;
    timestamp: string;
    network: string;
  };
}

export interface PaymentReleaseRequest {
  jobId: string;
  workerAddress: string;
  amount: number;
  workerLocation: {
    lat: number;
    lng: number;
  };
}

export interface PaymentReleaseResult {
  success: boolean;
  transactionHash?: string;
  amount?: number;
  fromAccount?: string;
  toAccount?: string;
  jobId?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  network?: string;
  realTransaction?: boolean;
  note?: string;
  error?: string;
}

/**
 * Verify worker location against job location
 */
export async function verifyLocation(
  request: LocationVerificationRequest
): Promise<LocationVerificationResult> {
  try {
    console.log('🌐 Calling backend verification API:', `${BACKEND_URL}/api/verify-location`);
    
    const response = await fetch(`${BACKEND_URL}/api/verify-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Verification failed:', errorText);
      throw new Error(`Verification failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Verification result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Location verification error:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Release payment to worker
 */
export async function releasePayment(
  request: PaymentReleaseRequest
): Promise<PaymentReleaseResult> {
  try {
    console.log('💰 Calling backend payment release API:', `${BACKEND_URL}/api/release-payment`);
    
    const response = await fetch(`${BACKEND_URL}/api/release-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Payment release failed:', errorText);
      throw new Error(`Payment release failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Payment release result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Payment release error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create real blockchain transaction
 */
export async function createRealTransaction(
  fromAccount: string,
  toAccount: string,
  amount: number,
  jobId: string,
  location: { latitude: number; longitude: number; radius: number }
): Promise<PaymentReleaseResult> {
  try {
    console.log('🔒 Calling backend create real transaction API:', `${BACKEND_URL}/api/v1/transactions`);
    
    const response = await fetch(`${BACKEND_URL}/api/v1/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAccount,
        toAccount,
        amount,
        jobId,
        location
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Transaction creation failed:', errorText);
      throw new Error(`Transaction creation failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Transaction creation result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Transaction creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get backend health status
 */
export async function getBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { success: false, error: 'Backend unavailable' };
  }
}
