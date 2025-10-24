'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

// Farcaster SDK types
declare global {
  interface Window {
    farcaster?: any;
    farcasterSdk?: any;
  }
}

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [farcasterWallet, setFarcasterWallet] = useState<any>(null);

  // Check if running in Farcaster environment
  useEffect(() => {
    const checkFarcasterEnvironment = () => {
      const sdk = window.farcaster || window.farcasterSdk;
      if (sdk && sdk.context) {
        setIsInFarcaster(true);
        
        // Check if wallet is already connected in Farcaster
        if (sdk.context.wallet) {
          setFarcasterWallet(sdk.context.wallet);
          console.log('Farcaster wallet detected:', sdk.context.wallet.address);
        }
      }
    };

    // Check immediately and after a short delay (for SDK loading)
    checkFarcasterEnvironment();
    const timer = setTimeout(checkFarcasterEnvironment, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFarcasterConnect = async () => {
    try {
      const sdk = window.farcaster || window.farcasterSdk;
      if (!sdk) {
        throw new Error('Farcaster SDK not available');
      }

      // Request wallet connection through Farcaster
      if (sdk.actions && sdk.actions.walletConnect) {
        await sdk.actions.walletConnect();
        
        // Check for wallet context after connection
        if (sdk.context && sdk.context.wallet) {
          setFarcasterWallet(sdk.context.wallet);
          console.log('Farcaster wallet connected:', sdk.context.wallet.address);
        }
      }
    } catch (error) {
      console.error('Farcaster wallet connection failed:', error);
    }
  };

  const handleRegularConnect = () => {
    connect({ 
      connector: coinbaseWallet({
        appName: 'Cast Colony',
        preference: 'smartWalletOnly',
      })
    });
  };

  // Show Farcaster wallet if connected
  if (isInFarcaster && farcasterWallet) {
    return (
      <div className="flex items-center justify-between p-3 bg-purple-800 rounded-lg">
        <div>
          <div className="text-sm text-purple-200">Connected via Farcaster</div>
          <div className="text-sm font-mono text-white">
            {farcasterWallet.address.slice(0, 6)}...{farcasterWallet.address.slice(-4)}
          </div>
        </div>
        <div className="text-purple-200 text-xs">
          🟣 Farcaster
        </div>
      </div>
    );
  }

  // Show regular wagmi wallet if connected
  if (isConnected && address) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
        <div>
          <div className="text-sm text-gray-400">Connected</div>
          <div className="text-sm font-mono text-white">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Farcaster Connection */}
      {isInFarcaster ? (
        <button
          onClick={handleFarcasterConnect}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors text-white"
        >
          🟣 Connect Farcaster Wallet
        </button>
      ) : (
        /* Regular Wallet Connection */
        <button
          onClick={handleRegularConnect}
          disabled={isPending}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-white"
        >
          {isPending ? 'Connecting...' : 'Connect Coinbase Smart Wallet'}
        </button>
      )}
      

    </div>
  );
}