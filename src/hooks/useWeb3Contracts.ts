'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
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
    chainId: contracts.chainId,
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
    chainId: contracts.chainId,
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
    chainId: contracts.chainId,
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
    chainId: contracts.chainId,
    query: {
      enabled: !!address && !!contracts.GAME_CONTRACT,
    },
  });
}

export function useClaimTile() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const claimTile = async (x: number, y: number) => {
    try {
      // Switch to correct network first
      await switchChain({ chainId: contracts.chainId });
      await new Promise(resolve => setTimeout(resolve, 1000));

      writeContract({
        address: contracts.GAME_CONTRACT as `0x${string}`,
        abi: GAME_CONTRACT_ABI,
        functionName: 'claimTile',
        args: [BigInt(x), BigInt(y)],
        chainId: contracts.chainId,
      });
    } catch (error) {
      console.error('Error in claimTile:', error);
    }
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
  const { switchChain } = useSwitchChain();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const harvestTiles = async (tileIds: number[]) => {
    try {
      // Switch to correct network first
      await switchChain({ chainId: contracts.chainId });
      await new Promise(resolve => setTimeout(resolve, 1000));

      const bigIntIds = tileIds.map(id => BigInt(id));
      writeContract({
        address: contracts.GAME_CONTRACT as `0x${string}`,
        abi: GAME_CONTRACT_ABI,
        functionName: 'harvestTiles',
        args: [bigIntIds],
        chainId: contracts.chainId,
      });
    } catch (error) {
      console.error('Error in harvestTiles:', error);
    }
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
  const { switchChain } = useSwitchChain();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const claimAirdrop = async () => {
    console.log('Attempting to claim airdrop with contract:', contracts.GAME_CONTRACT);
    console.log('Chain ID:', contracts.chainId);

    try {
      // First, try to switch to the correct network
      console.log('Switching to chain:', contracts.chainId);
      await switchChain({ chainId: contracts.chainId });

      // Small delay to ensure network switch is complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Then execute the transaction
      writeContract({
        address: contracts.GAME_CONTRACT as `0x${string}`,
        abi: GAME_CONTRACT_ABI,
        functionName: 'airdropNewPlayer',
        args: [],
        chainId: contracts.chainId,
      });
    } catch (error) {
      console.error('Error in claimAirdrop:', error);
    }
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