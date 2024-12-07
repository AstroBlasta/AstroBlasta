import type { PoolNotificationSettings } from "~/types/pool";
import { fetchPools } from "./pool.service";
import { sendPoolAlert } from "./telegram.service";


export async function checkingPools(settings: PoolNotificationSettings[]) {
    try {
        console.log('Checking pools...');
        console.log(settings);
        const pools = await fetchPools(settings.map(s => s.address));
        console.log(pools);
        for (const pool of pools) {
          const poolSetting = settings.find(s => s.poolId === pool.id && s.enabled);
          console.log(poolSetting);
          if (poolSetting && pool.percentageAPRs[0] < poolSetting.threshold) {
            console.log(pool.percentageAPRs[0]);
            await sendPoolAlert(pool, poolSetting.threshold);
          }
        }
        
        
      } catch (error) {
        console.error('Error checking pools:', error);
      }
}
