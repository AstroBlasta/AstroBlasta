import TelegramBot from 'node-telegram-bot-api';
import type { Pool } from '~/types/pool';

console.log('Telegram service loaded');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', { polling: false });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export async function  sendPoolAlert(pool: Pool, threshold: number) {
  const message = `🚨 Alert: Pool ${pool.name} (${pool.token1Symbol}-${pool.token2Symbol}) APR is below threshold!\n\nCurrent APR: ${pool.percentageAPRs[0].toFixed(2)}%\nThreshold: ${threshold}%\nTVL: $${pool.lp_staking_info.tvl.toLocaleString()}`;
  
  try {
    console.log('Sending Telegram message:', message);
    await bot.sendMessage(CHAT_ID, message);
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}
