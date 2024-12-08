import type { Pool } from "~/types/types";

export const calculateWeightedYield = (
  allocations: { poolId: string; amount: number }[],
  pools: Pool[],
): number => {
  const totalValue = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  if (totalValue === 0) return 0;

  return allocations.reduce((weightedYield, allocation) => {
    const pool = pools.find(p => p.poolId === allocation.poolId);
    if (!pool || !pool.percentageAPRs.length) return weightedYield;
    
    const weight = allocation.amount / totalValue;
    return weightedYield + (pool.percentageAPRs[0] * weight);
  }, 0);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};
