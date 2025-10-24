'use client';

import { useState, useEffect } from 'react';
import { useGameIntegration } from '@/hooks/useGameIntegration';
import { LoadingSpinner } from './LoadingSpinner';
import { WalletConnection } from './WalletConnection';

interface WelcomeScreenProps {
  onColonyCreated: () => void;
}

export function WelcomeScreen({ onColonyCreated }: WelcomeScreenProps) {
  const gameIntegration = useGameIntegration();
  const [colonyName, setColonyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Auto-load saved colony name when wallet connects
  useEffect(() => {
    if (gameIntegration.isConnected && gameIntegration.playerData.colony) {
      // Colony already exists, skip welcome screen
      onColonyCreated();
    }
  }, [gameIntegration.isConnected, gameIntegration.playerData.colony, onColonyCreated]);



  const validateColonyName = (name: string): string | null => {
    if (!name.trim()) return 'Colony name is required';
    if (name.trim().length < 3) return 'Colony name must be at least 3 characters';
    if (name.trim().length > 20) return 'Colony name must be 20 characters or less';
    return null;
  };

  const handleCreateColony = async () => {
    const validationError = validateColonyName(colonyName);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!gameIntegration.isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Create colony with wallet address as owner
      await gameIntegration.createColony(colonyName.trim());
      
      onColonyCreated();
    } catch (err) {
      setError('Failed to create colony. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColonyName(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cast Colony</h1>
          <p className="text-blue-200 text-lg">Claim. Harvest. Conquer.</p>
        </div>

        {/* Wallet Connection */}
        {!gameIntegration.isConnected && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold mb-3 text-center">Connect Your Wallet</h3>
            <p className="text-blue-200 text-sm text-center mb-4">
              Connect your wallet to start playing Cast Colony
            </p>
            <WalletConnection />
          </div>
        )}

        {/* Game Rules */}
        <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <h2 className="text-white font-semibold mb-3 text-center">How to Play</h2>
          <ul className="text-blue-100 text-sm space-y-2">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Claim adjacent tiles for 100 GEMS each</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span>
              <span>Harvest 10 GEMS per tile per hour</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              <span>Battle other colonies for territory</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Build the largest colony to win</span>
            </li>
          </ul>
        </div>

        {/* Colony Creation Form */}
        {gameIntegration.isConnected && (
          <div className="space-y-4">
            <div>
              <label htmlFor="colonyName" className="block text-white font-medium mb-2">
                Create Your Colony
              </label>
              <input
                id="colonyName"
                type="text"
                value={colonyName}
                onChange={handleInputChange}
                placeholder="Enter colony name..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                maxLength={20}
                disabled={isCreating}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              onClick={handleCreateColony}
              disabled={isCreating || !colonyName.trim()}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Creating Colony...
                </div>
              ) : (
                'Start Your Colony'
              )}
            </button>
          </div>
        )}

        {/* Show message when wallet is not connected */}
        {!gameIntegration.isConnected && (
          <div className="text-center">
            <p className="text-blue-200 text-sm">
              Please connect your wallet above to create your colony
            </p>
          </div>
        )}

        {/* Starter Info */}
        <div className="mt-6 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
          <p className="text-green-200 text-sm text-center">
            🎁 New colonies start with 100 GEMS
          </p>
        </div>
      </div>
    </div>
  );
}