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
