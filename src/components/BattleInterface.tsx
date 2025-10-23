'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Coordinate, TileData } from '@/types/game';
import { LoadingSpinner } from './LoadingSpinner';

interface BattleInterfaceProps {
  selectedTile: Coordinate | null;
  onBattleComplete?: (result: 'victory' | 'defeat') => void;
}

export function BattleInterface({ selectedTile, onBattleComplete }: BattleInterfaceProps) {
  const { state, dispatch, getTileByCoordinate } = useGame();
  const [attackGems, setAttackGems] = useState(100);
  const [isBattling, setIsBattling] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    result: 'victory' | 'defeat';
    attackerGems: number;
    defenderGems: number;
  } | null>(null);

  if (!selectedTile || !state.userState.colony) {
    return null;
  }

  const targetTile = getTileByCoordinate(selectedTile.x, selectedTile.y);
  
  // Only show battle interface for enemy tiles
  if (!targetTile || targetTile.owner === state.userState.colony.owner || !targetTile.owner) {
    return null;
  }

  const canAffordAttack = state.userState.treasury >= attackGems;
  const maxAttackGems = Math.min(state.userState.treasury, 1000); // Cap at 1000 GEMS

  const simulateDefenderGems = (): number => {
    // Simulate defender's GEMS (in real game, this would be hidden until reveal)
    // For demo purposes, generate a random amount between 50-300
    return Math.floor(Math.random() * 251) + 50;
  };

  const handleAttack = async () => {
    if (!canAffordAttack || !state.userState.colony) return;

    setIsBattling(true);
    setBattleResult(null);

    try {
      // Deduct GEMS for the attack
      dispatch({
        type: 'COMMIT_ATTACK',
        payload: {
          targetX: selectedTile.x,
          targetY: selectedTile.y,
          gemsCommitted: attackGems,
          commitment: `attack_${Date.now()}`, // Simplified commitment
          revealed: false,
        },
      });

      // Simulate battle delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate defender's GEMS and resolve battle
      const defenderGems = simulateDefenderGems();
      const attackerWins = attackGems > defenderGems;

      // Resolve the battle
      dispatch({
        type: 'RESOLVE_BATTLE',
        payload: {
          targetX: selectedTile.x,
          targetY: selectedTile.y,
          attackerGems: attackGems,
          defenderGems: defenderGems,
          attacker: state.userState.colony.owner,
        },
      });

      // Set battle result for display
      setBattleResult({
        result: attackerWins ? 'victory' : 'defeat',
        attackerGems: attackGems,
        defenderGems: defenderGems,
      });

      if (onBattleComplete) {
        onBattleComplete(attackerWins ? 'victory' : 'defeat');
      }

    } catch (error) {
      console.error('Battle failed:', error);
    } finally {
      setIsBattling(false);
    }
  };

  const resetBattle = () => {
    setBattleResult(null);
    setAttackGems(100);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-red-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Battle for Tile ({selectedTile.x}, {selectedTile.y})
        </h3>
        <div className="text-2xl">⚔️</div>
      </div>

      {/* Target Tile Info */}
      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Enemy Territory:</span>
          <span className="text-sm font-semibold text-red-600">
            Owner: {targetTile.owner}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          <p>• Defeat the defender to claim this tile</p>
          <p>• Higher GEMS commitment wins the battle</p>
          <p>• Lost GEMS are not refunded on defeat</p>
        </div>
      </div>

      {!battleResult ? (
        <>
          {/* Attack Configuration */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GEMS to Commit (Higher amount = better chance to win)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="50"
                max={maxAttackGems}
                step="10"
                value={attackGems}
                onChange={(e) => setAttackGems(Number(e.target.value))}
                disabled={isBattling}
                className="flex-1"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="50"
                  max={maxAttackGems}
                  step="10"
                  value={attackGems}
                  onChange={(e) => setAttackGems(Math.min(maxAttackGems, Math.max(50, Number(e.target.value))))}
                  disabled={isBattling}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                />
                <span className="text-sm text-gray-600">GEMS</span>
              </div>
            </div>
          </div>

          {/* Battle Stats */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Your Treasury:</span>
                <div className="font-semibold text-blue-600">{state.userState.treasury} GEMS</div>
              </div>
              <div>
                <span className="text-gray-600">After Attack:</span>
                <div className={`font-semibold ${
                  state.userState.treasury - attackGems >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {state.userState.treasury - attackGems} GEMS
                </div>
              </div>
            </div>
          </div>

          {/* Attack Button */}
          <button
            onClick={handleAttack}
            disabled={!canAffordAttack || isBattling}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
              canAffordAttack && !isBattling
                ? 'bg-red-500 hover:bg-red-600 text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isBattling ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Battle in Progress...
              </div>
            ) : !canAffordAttack ? (
              'Insufficient GEMS'
            ) : (
              `Attack with ${attackGems} GEMS`
            )}
          </button>
        </>
      ) : (
        /* Battle Result */
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${
            battleResult.result === 'victory' 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="text-center mb-3">
              <div className="text-3xl mb-2">
                {battleResult.result === 'victory' ? '🎉' : '💀'}
              </div>
              <h4 className={`text-xl font-bold ${
                battleResult.result === 'victory' ? 'text-green-700' : 'text-red-700'
              }`}>
                {battleResult.result === 'victory' ? 'VICTORY!' : 'DEFEAT!'}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="text-center">
                <div className="text-gray-600">Your Attack</div>
                <div className="text-lg font-bold text-blue-600">
                  {battleResult.attackerGems} GEMS
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Enemy Defense</div>
                <div className="text-lg font-bold text-red-600">
                  {battleResult.defenderGems} GEMS
                </div>
              </div>
            </div>

            <div className={`text-center text-sm ${
              battleResult.result === 'victory' ? 'text-green-700' : 'text-red-700'
            }`}>
              {battleResult.result === 'victory' ? (
                <>
                  <p className="font-semibold">Tile captured successfully!</p>
                  <p>The tile now belongs to your colony and will generate GEMS.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Attack failed!</p>
                  <p>Your {battleResult.attackerGems} GEMS were lost in the battle.</p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={resetBattle}
            className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Close Battle Report
          </button>
        </div>
      )}

      {/* Battle Tips */}
      {!battleResult && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-yellow-600 mr-2">💡</span>
            <span className="text-sm font-medium text-yellow-800">Battle Tips:</span>
          </div>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Commit more GEMS for higher chance of victory</li>
            <li>• Enemy defense strength is unknown until battle</li>
            <li>• Lost GEMS are gone forever - choose wisely!</li>
            <li>• Captured tiles immediately start generating GEMS</li>
          </ul>
        </div>
      )}
    </div>
  );
}