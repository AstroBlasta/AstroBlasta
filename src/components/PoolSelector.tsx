import type { Pool, Asset } from "~/types/types";
import { formatPercentage } from "~/utils/calculations";
import type { QRL } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

interface PoolSelectorProps {
  pools: Pool[];
  assets: Asset[];
  onPoolSelect$: QRL<(poolId: string) => void>;

  selectedPools: string[];
}

export default component$<PoolSelectorProps>(
  (
    {
      pools,
      assets,
      onPoolSelect$,
      selectedPools
    }
  ) => {
    const getAssetSymbol = (assetInfo: Pool["poolAssets"][0]["info"]) => {
      if (assetInfo.token) {
        return assets.find(a => a.address === assetInfo.token?.contract_addr)?.symbol ||
          assets.find(a => a.id === assetInfo.token?.contract_addr)?.symbol ||
          "Unknown";
      }
      if (assetInfo.native_token) {
        return assets.find(a => a.denom === assetInfo.native_token?.denom)?.symbol || "Unknown";
      }
      return "Unknown";
    };

    const getPoolAPY = (pool: Pool) => {
      return pool.percentageAPRs[0] || 0;
    };

    const getUniquePoolId = (pool: Pool) => {
      return `${pool.contextChainId || "unknown"}-${pool.poolId}`;
    };

    const activePools = pools.filter(pool =>
      pool.percentageAPRs.length > 0 &&
      !pool.disabled &&
      pool.type !== "deprecated"
    );

    return (
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Available Liquidity Pools</h2>
        <div class="space-y-4">
          {activePools
            .sort((a, b) => getPoolAPY(b) - getPoolAPY(a))
            .map(pool => {
              const assetPair = pool.poolAssets.map(asset => getAssetSymbol(asset.info)).join(" / ");
              const apy = getPoolAPY(pool);
              const uniqueId = getUniquePoolId(pool);

              return (
                <div
                  key={uniqueId}
                  class={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPools.includes(pool.poolId)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:shadow"
                  }`}
                  onClick$={() => onPoolSelect$(pool.poolId)}
                >
                  <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                      <span class="font-semibold text-lg">{assetPair}</span>
                      <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-500">
                        {pool.type.charAt(0).toUpperCase() + pool.type.slice(1)} Pool
                      </span>
                        <span class="text-xs text-gray-400">
                        {pool.contextChainId}
                      </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-green-600 text-lg">
                        {formatPercentage(apy)}
                      </div>
                      <div class="text-sm text-gray-500">APY</div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
);
