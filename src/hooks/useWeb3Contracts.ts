'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getCurrentContracts } from '@/contracts/addresses';
import { GEMS_TOKEN_ABI, GAME_CONTRACT_ABI } from '@/contracts/abis';

const contracts = getCurrentContracts();

// GEMS Token Hooks
export function useGemsBalance(address?: `0x${string}`) {
  return useReadContract({
    address: contracts.GEMS_TOKEN as `0x${string}`,
    abi: GEMS_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts.GEMS_TOKEN,
    },
  });
}

// Game Contract Hooks
export function useTilePrice(address?: `0x${string}`) {
  return useReadContract({
    address: contracts.GAME_CONTRACT as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'getTilePrice',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts.GAME_CONTRACT,
    },
  });
}

export function usePlayerTileCount(address?: `0x${string}`) {
  return useReadContract({
    address: contracts.GAME_CONTRACT as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'getPlayerTileCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts.GAME_CONTRACT,
    },
  });
}

export function useHasReceivedAirdrop(address?: `0x${string}`) {
  return useReadContract({
    address: contracts.GAME_CONTRACT as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'hasReceivedAirdrop',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts.GAME_CONTRACT,
    },
  });
}

export function useClaimTile() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash,
    });

  const claimTile = (x: number, y: number) => {
    writeContract({
      address: contracts.GAME_CONTRACT as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'claimTile',
      args: [BigInt(x), BigInt(y)],
    });
  };

  return {
    claimTile,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useHarvestTiles() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash,
    });

  const harvestTiles = (tileIds: number[]) => {
    const bigIntIds = tileIds.map(id => BigInt(id));
    writeContract({
      address: contracts.GAME_CONTRACT as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'harvestTiles',
      args: [bigIntIds],
    });
  };

  return {
    harvestTiles,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useAirdropNewPlayer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash,
    });

  const claimAirdrop = () => {
    writeContract({
      address: contracts.GAME_CONTRACT as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'airdropNewPlayer',
      args: [],
    });
  };

  return {
    claimAirdrop,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Utility functions
export function formatGemsBalance(balance?: bigint): string {
  if (!balance) return '0';
  return formatEther(balance);
}

export function parseGemsAmount(amount: number): bigint {
  return parseEther(amount.toString());
}