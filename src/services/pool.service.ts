import type { Pool } from '~/types/pool';

interface AstroVaultResponse {
  pools: Array<{
    id: string;
    name: string;
    percentageAPRs: number;
    lp_staking_info: {
      tvl: number;
    };
    token1Symbol: string;
    token2Symbol: string;
  }>;
}

export async function fetchPools(): Promise<Pool[]> {
  try {
    const response = await fetch('https://ext.astrovault.io/pool', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AstroVaultResponse = await response.json();
    console.log(data);
    if (!data || !Array.isArray(data.data)) {
      console.error('Invalid response format from AstroVault API');
      return [];
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching pools:', error);
    return [];
  }
}