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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Buy GEMS
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isPending || isConfirming}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Exchange Rate Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="text-sm">
            <div className="font-semibold text-blue-800 mb-3 flex items-center">
              <span className="mr-2">📊</span>
              Exchange Rate
            </div>
            <div className="space-y-1 text-gray-800">
              <div className="flex justify-between">
                <span>0.1 ETH</span>
                <span className="font-medium">= 500 GEMS</span>
              </div>
              <div className="flex justify-between">
                <span>1 ETH</span>
                <span className="font-medium">= 5,000 GEMS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label htmlFor="ethAmount" className="block text-sm font-medium text-gray-700 mb-3">
            ETH Amount
          </label>
          <div className="relative">
            <input
              id="ethAmount"
              type="number"
              step="0.01"
              min="0"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              disabled={isPending || isConfirming}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-lg font-medium text-gray-900"
              placeholder="0.1"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-medium">
              ETH
            </div>
          </div>

          {/* GEMS Preview */}
          {isValidAmount && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600">You will receive:</div>
              <div className="text-xl font-bold text-green-700">
                {gemsAmount.toLocaleString()} GEMS
              </div>
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
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleBuyGems}
            disabled={!isValidAmount || isPending || isConfirming || !gameIntegration.isConnected}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
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
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span className="mr-2">⚡</span>
            Quick amounts:
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['0.05', '0.1', '0.2', '0.5'].map((amount) => (
              <button
                key={amount}
                onClick={() => setEthAmount(amount)}
                disabled={isPending || isConfirming}
                className="px-3 py-2 text-sm font-medium text-gray-800 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-all duration-200"
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