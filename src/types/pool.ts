export interface Pool {
  id: string;
  address: string;
  name: string;
  percentageAPRs: number[];
  lp_staking_info: {
    tvl: string
  }
  token1Symbol: string;
  token2Symbol: string;
}

export interface PoolNotificationSettings {
  poolId: string;
  address: string;
  threshold: number;
  enabled: boolean;
}
