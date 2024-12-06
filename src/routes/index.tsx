import { component$, useSignal, useVisibleTask$, $, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { fetchPools } from '~/services/pool.service';
import type { Pool, PoolNotificationSettings } from '~/types/pool';

export default component$(() => {
  const pools = useSignal<Pool[]>([]);
  const settings = useStore<{ list: PoolNotificationSettings[] }>({ list: [] });
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);

  // Load pools on component mount
  useVisibleTask$(async () => {
    try {
      loading.value = true;
      error.value = null;
      pools.value = await fetchPools();
    } catch (e) {
      error.value = 'Failed to load pools. Please try again later.';
    } finally {
      loading.value = false;
    }
  });

  const updateThreshold = $((poolId: string, threshold: number) => {
    const existingIndex = settings.list.findIndex(s => s.poolId === poolId);
    if (existingIndex >= 0) {
      settings.list[existingIndex].threshold = threshold;
    } else {
      settings.list = [...settings.list, { poolId, threshold, enabled: true }];
    }
  });

  const toggleNotification = $((poolId: string) => {
    const existingIndex = settings.list.findIndex(s => s.poolId === poolId);
    if (existingIndex >= 0) {
      settings.list[existingIndex].enabled = !settings.list[existingIndex].enabled;
    }
  });

  return (
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">AstroVault Pool Monitor</h1>
      
      {loading.value ? (
        <div class="text-center">Loading pools...</div>
      ) : error.value ? (
        <div class="text-center text-red-600">{error.value}</div>
      ) : (
        <div class="grid gap-6">
          {pools.value.map((pool) => {
            const poolSetting = settings.list.find(s => s.poolId === pool.id);
            
            return (
              <div key={pool.id} class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center">
                  <h2 class="text-xl font-semibold">
                    {pool.token1Symbol}-{pool.token2Symbol}
                  </h2>
                  <span class="text-lg font-bold text-green-600">
                    {pool.percentageAPRs}% APR
                  </span>
                </div>
                
                <div class="mt-4 flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="APR Threshold"
                    value={poolSetting?.threshold || ''}
                    onChange$={(e) => updateThreshold(pool.id, parseFloat((e.target as HTMLInputElement).value))}
                    class="border rounded px-3 py-2 w-32"
                  />
                  
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={poolSetting?.enabled}
                      onChange$={() => toggleNotification(pool.id)}
                    />
                    Enable Notifications
                  </label>
                </div>
                
                <div class="mt-2 text-sm text-gray-600">
                  TVL: ${pool.lp_staking_info.tvl.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'AstroVault Pool Monitor',
  meta: [
    {
      name: 'description',
      content: 'Monitor AstroVault pools and receive Telegram notifications',
    },
  ],
};