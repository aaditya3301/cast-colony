'use client';

import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    connect({ 
      connector: coinbaseWallet({
        appName: 'Cast Colony',
        preference: 'smartWalletOnly',
      })
    });
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">Connected</span>
          <span className="text-sm font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
    >
      {isPending ? 'Connecting...' : 'Connect Coinbase Smart Wallet'}
    </button>
  );
}