import { component$, $, useStore } from "@builder.io/qwik";
import LoadingSpinner from "~/components/LoadingSpinner";
import ErrorMessage from "~/components/ErrorMessage";
import PoolSelector from "~/components/PoolSelector";
import StrategyBuilder from "~/components/StrategyBuilder";
import { useAstroVault } from "~/hooks/useAstroVault";

export default component$(() => {

  const selectedPools = useStore<{ value: string[] }>({ value: [] });
  const { pools, assets, loading, error } = useAstroVault();

  const handlePoolSelect = $((poolId: string) => {
    selectedPools.value = selectedPools.value.includes(poolId)
      ? selectedPools.value.filter(id => id !== poolId)
      : [...selectedPools.value, poolId]
  });

  if (loading.value) {
    return <LoadingSpinner />;
  }

  if (error.value) {
    return <ErrorMessage message={error.value} />;
  }

  return (
    <div class="min-h-screen bg-gray-100 p-8 text-black">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">DeFi Strategy Comparison Tool</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PoolSelector
            pools={pools.value}
            assets={assets.value}
            onPoolSelect$={handlePoolSelect}
            selectedPools={selectedPools.value}
          />

          <StrategyBuilder
            pools={pools.value}
            assets={assets.value}
            selectedPools={selectedPools.value}
          />
        </div>
      </div>
    </div>
  );
});
