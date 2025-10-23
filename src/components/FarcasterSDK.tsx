'use client';

import { useEffect } from 'react';

export function FarcasterSDK() {
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        await sdk.actions.ready();
        console.log('Mini App ready - splash screen hidden');
      } catch (error) {
        console.warn('SDK not available - running outside Farcaster');
      }
    };
    
    initializeSDK();
  }, []);

  return null; // This component doesn't render anything
}