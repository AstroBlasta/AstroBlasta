
import type { Pool, Asset } from '~/types/types';
import { fetchPools, fetchAssets, fetchFarms } from '~/services/astrovault';
import { useSignal, useTask$ } from "@builder.io/qwik";

export const useAstroVault = () => {
  const pools = useSignal<Pool[]>([]);
  const assets = useSignal<Asset[]>([]);
  const farms = useSignal<any[]>([]);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);

  useTask$(async () => {
    let mounted = true;

    const fetchData = async () => {
      try {
        loading.value = true;
        const [poolsData, assetsData, farmsData] = await Promise.all([
          fetchPools(),
          fetchAssets(),
          fetchFarms()
        ]);

        if (!mounted) return;
        pools.value = poolsData;
        assets.value = assetsData;
        farms.value = farmsData;
        error.value = null;
      } catch (err) {
        if (!mounted) return;
        error.value = 'Failed to fetch data. Please try again later.';
        console.error('Error fetching data:', err);
      } finally {
        if (mounted) {
          loading.value = false;
        }
      }
    };

    await fetchData();

    return () => {
      mounted = false;
    };
  });

  return { pools, assets, farms, loading, error };
};
