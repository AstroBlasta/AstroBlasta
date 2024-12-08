// src/routes/index.tsx

import { component$, useSignal, $, useStore, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { fetchPools } from '~/services/pool.service';
import type { Pool, PoolNotificationSettings } from '~/types/pool';
import { server$ } from '@builder.io/qwik-city';
import { checkingPools } from '~/services/threshold.service';
import type { PoolInfo } from "~/types/poolInfo";
import { fetchInfo, getLabel } from "~/services/info.service";

export const serverGreeter = server$(checkingPools);

export default component$(() => {
  const pools = useSignal<Pool[]>([]);
  const settings = useStore<{ list: PoolNotificationSettings[] }>({ list: [] });
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const notify = useSignal(false);
  const poolInfo = useSignal<PoolInfo[]>([]);

  // Load pools on component mount
  useTask$(async () => {
    try {
      loading.value = true;
      error.value = null;
      pools.value = await fetchPools();
      poolInfo.value = await fetchInfo();
      console.log(poolInfo.value);
    } catch (e) {
      error.value = 'Failed to load pools. Please try again later.';
    } finally {
      loading.value = false;
    }
  });

  useTask$(async ({ track, cleanup }) => {
    const newText = track(settings);
    const newPoolInfo = track(poolInfo);
    
    await serverGreeter(newText.list, newPoolInfo);

    const update = async () => {
      if (notify.value) {
        await serverGreeter(settings.list, poolInfo.value);
      }
    };

    const id = setInterval(update, 10000);
    if (!notify.value) {
      cleanup(() => clearInterval(id));
    }
  });

  const updateThreshold = $((poolId: string, threshold: number, address: string) => {
    const existingIndex = settings.list.findIndex(s => s.poolId === poolId);
    if (existingIndex >= 0) {
      settings.list[existingIndex].threshold = threshold;
    } else {
      settings.list = [...settings.list, { poolId, threshold, enabled: true, address }];
    }
  });

  const toggleNotification = $((poolId: string) => {
    const existingIndex = settings.list.findIndex(s => s.poolId === poolId);
    if (existingIndex >= 0) {
      settings.list[existingIndex].enabled = !settings.list[existingIndex].enabled;
    }
    const notifications = settings.list.filter(s => s.enabled);
    notify.value = notifications.length > 0;
  });

  return (
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-5xl font-extrabold text-gray-800 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4 rounded-lg shadow-lg">
          AstroVault Pool Monitor
        </h1>
      </div>
      
      {loading.value ? (
        <div class="text-center">Loading pools...</div>
      ) : error.value ? (
        <div class="text-center text-red-600">{error.value}</div>
      ) : (
        <div class="grid gap-6 grid-cols-2">
          {pools.value.map((pool) => {
            const poolSetting = settings.list.find(s => s.poolId === pool.id);
            const { label, poolName } = getLabel(pool.address, poolInfo.value);
            
            return (
              <div key={pool.id} class="relative p-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg transform transition-transform hover:scale-105 hover:shadow-lg">
                <div class="bg-white rounded-lg shadow-lg p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-gray-800">
                      {label}
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
                      onChange$={(e) => updateThreshold(pool.id, parseFloat((e.target as HTMLInputElement).value), pool.address)}
                      class="border rounded px-3 py-2 w-[90%] text-black" // Decreased width by 10%
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
                    Pool Name: {poolName}
                  </div>
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