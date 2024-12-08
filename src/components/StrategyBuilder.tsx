import type { Pool, Asset, Strategy } from "~/types/types";
import { calculateWeightedYield, formatCurrency, formatPercentage } from "~/utils/calculations";
import { component$, useStore, $, useSignal } from "@builder.io/qwik";

interface StrategyBuilderProps {
  pools: Pool[];
  assets: Asset[];
  selectedPools: string[];
}

export default component$<StrategyBuilderProps>(({
  pools,
  assets,
  selectedPools,
}) => {
  const strategies = useSignal<Strategy[]>([]);
  const currentStrategy = useStore<Strategy>({
    name: '',
    allocations: [],
    weightedYield: 0,
    totalValue: 0,
  });

  const getAssetSymbol = (assetInfo: Pool['poolAssets'][0]['info']) => {
    if (assetInfo.token) {
      return assets.find(a => a.address === assetInfo.token?.contract_addr)?.symbol || 
             assets.find(a => a.id === assetInfo.token?.contract_addr)?.symbol || 
             'Unknown';
    }
    if (assetInfo.native_token) {
      return assets.find(a => a.denom === assetInfo.native_token?.denom)?.symbol || 'Unknown';
    }
    return 'Unknown';
  };

  const getUniquePoolId = (pool: Pool) => {
    return `${pool.contextChainId || 'unknown'}-${pool.poolId}`;
  };

  const handleAllocationChange = $((poolId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const newAllocations = currentStrategy.allocations.filter(a => a.poolId !== poolId);
    
    if (numAmount > 0) {
      newAllocations.push({ poolId, amount: numAmount });
    }

    const totalValue = newAllocations.reduce((sum, a) => sum + a.amount, 0);
    const weightedYield = calculateWeightedYield(newAllocations, pools);

    currentStrategy.allocations = newAllocations;
    currentStrategy.weightedYield = weightedYield;
    currentStrategy.totalValue = totalValue;
  });

  const saveStrategy = $(() => {
    if (currentStrategy.name && currentStrategy.allocations.length > 0) {
      strategies.value = [...strategies.value, currentStrategy];
      currentStrategy.name = '';
      currentStrategy.allocations = [];
      currentStrategy.weightedYield = 0;
      currentStrategy.totalValue = 0;
    }
  });

  return (
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Strategy Builder</h2>
        
        <div class="space-y-4">
          <input
            type="text"
            placeholder="Strategy Name"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={currentStrategy.name}
            onChange$={(e) => currentStrategy.name = (e.target as HTMLInputElement).value}
          />
          
          {selectedPools.map(poolId => {
            const pool = pools.find(p => p.poolId === poolId);
            if (!pool) return null;
            
            const assetPair = pool.poolAssets.map(asset => getAssetSymbol(asset.info)).join(' / ');
            const allocation = currentStrategy.allocations.find(a => a.poolId === poolId);
            const uniqueId = getUniquePoolId(pool);
            
            return (
              <div key={uniqueId} class="p-4 border rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <div>
                    <span class="font-medium">{assetPair}</span>
                    <span class="text-xs text-gray-400 ml-2">
                      {pool.contextChainId}
                    </span>
                  </div>
                  <span class="text-green-600">
                    {formatPercentage(pool.percentageAPRs[0] || 0)} APY
                  </span>
                </div>
                <input
                  type="number"
                  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Amount in USD"
                  value={allocation?.amount || ''}
                  onChange$={(e) => handleAllocationChange(poolId, (e.target as HTMLInputElement).value)}
                  min="0"
                  step="0.01"
                />
              </div>
            );
          })}
          
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between mb-2">
              <span class="font-medium">Total Value:</span>
              <span>{formatCurrency(currentStrategy.totalValue)}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Expected Yield:</span>
              <span class="text-green-600">
                {formatPercentage(currentStrategy.weightedYield)}
              </span>
            </div>
          </div>
          
          <button
            class="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick$={saveStrategy}
            disabled={!currentStrategy.name || currentStrategy.allocations.length === 0}
          >
            Save Strategy
          </button>
        </div>
      </div>

      {strategies.value.length > 0 && (
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-6">Saved Strategies</h2>
          <div class="space-y-4">
            {strategies.value.map((strategy, index) => (
              <div key={`strategy-${index}`} class="p-4 border rounded-lg">
                <h3 class="text-xl font-bold mb-2">{strategy.name}</h3>
                <div class="space-y-2">
                  {strategy.allocations.map(allocation => {
                    const pool = pools.find(p => p.poolId === allocation.poolId);
                    if (!pool) return null;
                    
                    const assetPair = pool.poolAssets
                      .map(asset => getAssetSymbol(asset.info))
                      .join(' / ');
                    
                    return (
                      <div key={`${strategy.name}-${allocation.poolId}`} class="flex justify-between">
                        <div>
                          <span>{assetPair}</span>
                          <span class="text-xs text-gray-400 ml-2">
                            {pool.contextChainId}
                          </span>
                        </div>
                        <span>{formatCurrency(allocation.amount)}</span>
                      </div>
                    );
                  })}
                  <div class="border-t pt-2 mt-2">
                    <div class="flex justify-between">
                      <span class="font-medium">Total Value:</span>
                      <span>{formatCurrency(strategy.totalValue)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-medium">Expected Yield:</span>
                      <span class="text-green-600">
                        {formatPercentage(strategy.weightedYield)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
