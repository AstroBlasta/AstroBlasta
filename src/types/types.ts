export interface Pool {
  id: string;
  type: string;
  poolId: string;
  percentageAPRs: number[];
  disabled: boolean;
  poolAssets: {
    info: {
      token?: {
        contract_addr: string;
      };
      native_token?: {
        denom: string;
      };
    };
    amount: string;
  }[];
  contextChainId?: string;
}

export interface Asset {
  id: string;
  symbol: string;
  price: number;
  decimals: number;
  price_24h_change: number | null;
  isNative?: boolean;
  address?: string;
  denom?: string;
  totalSupply?: string;
  contextChainId?: string;
}

export interface Strategy {
  name: string;
  allocations: {
    poolId: string;
    amount: number;
  }[];
  weightedYield: number;
  totalValue: number;
}

export interface Farm {
  label: string;
  address: string;
  percentageAPRs: number[];
  reward_sources: {
    reward_asset: {
      token?: {
        contract_addr: string;
      };
      native_token?: {
        denom: string;
      };
    };
    source_addr: string;
    active: boolean;
  }[];
  config: {
    inc_token: string;
  };
  contextChainId: string;
}
