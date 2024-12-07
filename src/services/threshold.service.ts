import type { PoolNotificationSettings } from "~/types/pool";
import { fetchPools } from "./pool.service";
import { sendPoolAlert } from "./telegram.service";


export async function checkingPools(settings: PoolNotificationSettings[]) {
    try {
        const pools = await fetchPools(settings.map(s => s.address));

        for (const pool of pools) {
          const poolSetting = settings.find(s => s.poolId === pool.id && s.enabled);

          if (poolSetting && pool.percentageAPRs[0] < poolSetting.threshold) {
            await sendPoolAlert(pool, poolSetting.threshold);
          }
        }
        
        
      } catch (error) {
        console.error('Error checking pools:', error);
      }
}
