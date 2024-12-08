import type { PoolNotificationSettings } from "~/types/pool";
import { fetchPools as fetchPoolsFromService } from "./pool.service";
import { sendPoolAlert } from "./telegram.service";
import type { PoolInfo } from "~/types/poolInfo";
import { getLabel } from "~/services/info.service";

// src/services/threshold.service.ts

export async function checkingPools(settings: PoolNotificationSettings[], poolInfo: PoolInfo[]) {
  try {
    const pools = await fetchPoolsFromService(settings.map(s => s.address));

    for (const pool of pools) {
      const poolSetting = settings.find(s => s.poolId === pool.id && s.enabled);
      const { label } = getLabel(pool.address, poolInfo);
      if (poolSetting && pool.percentageAPRs[0] < poolSetting.threshold) {
        await sendPoolAlert(pool, poolSetting.threshold, label);
      }
    }
  } catch (error) {
    console.error('Error checking pools:', error);
  }
}

// src/services/pool.service.ts

import type { Pool } from '~/types/pool';

interface AstroVaultResponse {
  data: Array<Pool>;
}

export async function fetchPools(addressIds?: string[]): Promise<Pool[]> {
  try {
    const url = new URL('/pool', 'https://ext.astrovault.io');
    if (addressIds && addressIds.length) {
      url.search = new URLSearchParams({ addresses: addressIds.join(',') }).toString();
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AstroVaultResponse = await response.json();
    
    if (!data || !Array.isArray(data.data)) {
      console.error('Invalid response format from AstroVault API');
      return [];
    }

    /** sort data.data by percentageAPRs */
    data.data = data.data.sort((a, b) => {
      return b.percentageAPRs[0] - a.percentageAPRs[0];
    });

    return data.data as Pool[];
  } catch (error) {
    console.error('Error fetching pools:', error);
    return [];
  }
}
