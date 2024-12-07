import type { PoolInfo } from "~/types/poolInfo";

export interface Info {
  pools: PoolInfo[];
}

export async function fetchInfo(): Promise<PoolInfo[]> {
  try {
    console.log('fetching pool info');
    const response = await fetch('https://ext.astrovault.io/info/items', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const archway: PoolInfo[] = data.data.archway['stable-pool'].map(
      (pool: any): PoolInfo => {
        return {
          address: pool.address,
          label: pool.label
        }
      }
    );
    const archway2: PoolInfo[] = data.data.archway['standard-pool'].map(
      (pool: any): PoolInfo => {
        return {
          address: pool.address,
          label: pool.label
        }
      }
    );
    const archway3: PoolInfo[] = data.data.archway['hybrid-pools'].map(
      (pool: any): PoolInfo => {
        return {
          address: pool.address,
          label: pool.label
        }
      }
    );
    const neutron: PoolInfo[] = data.data.neutron['stable-pool'].map(
      (pool: any): PoolInfo => {
        return {
          address: pool.address,
          label: pool.label
        }
      }
    );
    const neutron2: PoolInfo[] = data.data.neutron['standard-pool'].map(
      (pool: any): PoolInfo => {
        return {
          address: pool.address,
          label: pool.label
        }
      }
    );
    const neutron3: PoolInfo[] = data.data.neutron['hybrid-pools'].map(
      (pool: any): PoolInfo => {
        return {
          address: pool.address,
          label: pool.label
        }
      }
    );
    const pools = archway.concat(archway2, archway3, neutron, neutron2, neutron3);
    console.log(pools);
    if (!data || !Array.isArray(pools)) {
      console.error('Invalid response format from AstroVault API');
      return [];
    }

    return pools;
  } catch (error) {
    console.error('Error fetching pools:', error);
    return [];
  }
}

export function getLabel(address: string, pools: PoolInfo[]): string {
  console.log(pools);
  const pool = pools.find(p => p.address === address);
  return pool ? pool.label : 'hola';
}
