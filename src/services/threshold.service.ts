import type { PoolNotificationSettings } from "~/types/pool";
import { fetchPools } from "./pool.service";
import { sendPoolAlert } from "./telegram.service";
import type { PoolInfo } from "~/types/poolInfo";
import { getLabel } from "~/services/info.service";


export async function checkingPools(settings: PoolNotificationSettings[], poolInfo: PoolInfo[]) {
    try {
        const pools = await fetchPools(settings.map(s => s.address));

        for (const pool of pools) {
          const poolSetting = settings.find(s => s.poolId === pool.id && s.enabled);
          const info = getLabel(pool.address, poolInfo);
          if (poolSetting && pool.percentageAPRs[0] < poolSetting.threshold) {
            await sendPoolAlert(pool, poolSetting.threshold, info);
          }
        }
        
        
      } catch (error) {
        console.error('Error checking pools:', error);
      }
}
