'use client';

import { useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import { WelcomeScreen, GameMap, ColonyDashboard } from '@/components';

export default function DemoPage() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-50">
        {showWelcome ? (
          <WelcomeScreen onColonyCreated={() => setShowWelcome(false)} />
        ) : (
          <div className="space-y-6 py-6">
            <ColonyDashboard />
            <GameMap />
          </div>
        )}
      </div>
    </GameProvider>
  );
}