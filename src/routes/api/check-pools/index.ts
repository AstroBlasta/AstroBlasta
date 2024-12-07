import type { RequestHandler } from '@builder.io/qwik-city';
import { fetchPools } from '~/services/pool.service';
import { sendPoolAlert } from '~/services/telegram.service';
import type { PoolNotificationSettings } from '~/types/pool';

export const onGet: RequestHandler = async ({ json, env }) => {
  try {
    // This would typically come from a database
    const settings: PoolNotificationSettings[] = JSON.parse(env.get('POOL_SETTINGS') || '[]');
    
    const pools = await fetchPools();
    
    for (const pool of pools) {
      const poolSetting = settings.find(s => s.poolId === pool.id && s.enabled);
      
      if (poolSetting && pool.percentageAPRs[0] < poolSetting.threshold) {
        console.log(pool.percentageAPRs[0]);
        await sendPoolAlert(pool, poolSetting.threshold);
      }
    }
    
    json(200, { success: true });
  } catch (error) {
    console.error('Error checking pools:', error);
    json(500, { success: false, error: 'Internal server error' });
  }
};