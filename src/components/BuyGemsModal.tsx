'use client';

import { useState } from 'react';
import { useGameIntegration } from '@/hooks/useGameIntegration';
import { LoadingSpinner } from './LoadingSpinner';

interface BuyGemsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyGemsModal({ isOpen, onClose }: BuyGemsModalProps) {
  const gameIntegration = useGameIntegration();
  const [ethAmount, setEthAmount] = useState('0.1');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Calculate GEMS amount (0.1 ETH = 500 GEMS, so 1 ETH = 5000 GEMS)
  const gemsAmount = parseFloat(ethAmount || '0') * 5000;
  const isValidAmount = parseFloat(ethAmount || '0') > 0;
  const isPending = gameIntegration.transactions.buyGems.isPending;
  const isConfirming = gameIntegration.transactions.buyGems.isConfirming;

  const handleBuyGems = async () => {
    if (!isValidAmount) {
      setError('Please enter a valid ETH amount');
      return;
    }

    setError('');
    try {
      await gameIntegration.buyGems(ethAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy GEMS');
    }
  };

  const handleClose = () => {
    if (!isPending && !isConfirming) {
      onClose();
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Buy GEMS</h2>
          <button
            onClick={handleClose}
            disabled={isPending || isConfirming}
            className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Exchange Rate Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <div className="font-semibold mb-2">Exchange Rate</div>
            <div>0.1 ETH = 500 GEMS</div>
            <div>1 ETH = 5,000 GEMS</div>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label htmlFor="ethAmount" className="block text-sm font-medium text-gray-700 mb-2">
            ETH Amount
          </label>
          <input
            id="ethAmount"
            type="number"
            step="0.01"
            min="0"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            disabled={isPending || isConfirming}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="0.1"
          />
          
          {/* GEMS Preview */}
          {isValidAmount && (
            <div className="mt-2 text-sm text-gray-600">
              You will receive: <span className="font-semibold text-green-600">{gemsAmount.toLocaleString()} GEMS</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Transaction Status */}
        {(isPending || isConfirming) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-blue-800 text-sm">
                {isPending ? 'Waiting for wallet confirmation...' : 'Transaction confirming...'}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isPending || isConfirming}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleBuyGems}
            disabled={!isValidAmount || isPending || isConfirming || !gameIntegration.isConnected}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                {isPending ? 'Confirming...' : 'Processing...'}
              </div>
            ) : (
              'Buy GEMS'
            )}
          </button>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Quick amounts:</div>
          <div className="flex gap-2">
            {['0.05', '0.1', '0.2', '0.5'].map((amount) => (
              <button
                key={amount}
                onClick={() => setEthAmount(amount)}
                disabled={isPending || isConfirming}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                {amount} ETH
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}