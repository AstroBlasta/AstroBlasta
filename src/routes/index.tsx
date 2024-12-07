import { component$, useSignal, $, useStore, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { fetchPools } from '~/services/pool.service';
import type { Pool, PoolNotificationSettings } from '~/types/pool';
import { server$ } from '@builder.io/qwik-city';
import { checkingPools } from '~/services/threshold.service';

//const delay = (time: number) => new Promise((res) => setTimeout(res, time));


export const serverGreeter = server$(checkingPools);

export default component$(() => {
  const pools = useSignal<Pool[]>([]);
  const settings = useStore<{ list: PoolNotificationSettings[] }>({ list: [] });
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const notify = useSignal(false);

  // Load pools on component mount
  useTask$(async () => {
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

  useTask$(async ({ track, cleanup }) => {
    // Passing a signal directly is more efficient than using a function.
    const newText = track(settings);
    
    await serverGreeter(newText.list);

    const update = async () => {
      console.log(notify.value);
      if (notify.value) {
        await serverGreeter(settings.list);
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
      notify.value = true;
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
                    onChange$={(e) => updateThreshold(pool.id, parseFloat((e.target as HTMLInputElement).value), pool.address)}
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
