export interface WebhookPayload {
  itemTitle: string;
  price: number;
  originalPrice: number;
  lowestPrice: number;
  url: string;
  retailer: string;
  alertType: 'target_met' | 'all_time_low' | 'flash_drop';
  addedBy: string;
}

export async function sendWebhookAlert(payload: WebhookPayload, config?: { webhookUrl?: string; telegramBotToken?: string; telegramChatId?: string }) {
  if (!config) return { success: false, reason: 'No webhook configured' };

  const message = `🚨 *DEALSQUAD ALERT for Pravin, Sweta, Priyesh & Shreyash!* 🎯\n\n` +
    `📦 *Item:* ${payload.itemTitle}\n` +
    `💰 *Price Dropped To:* ₹${payload.price.toLocaleString('en-IN')} (MRP: ₹${payload.originalPrice.toLocaleString('en-IN')})\n` +
    `🏷️ *Store:* ${payload.retailer.toUpperCase()}\n` +
    `🔥 *Event:* ${payload.alertType === 'target_met' ? '🎯 Target Price Hit!' : '⚡ All-Time Low Detected!'}\n` +
    `👤 *Tracked By:* ${payload.addedBy}\n\n` +
    `🔗 *Buy Link:* ${payload.url}`;

  // 1. Telegram Bot API if configured
  if (config.telegramBotToken && config.telegramChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
      return { success: true, target: 'telegram' };
    } catch (err) {
      console.error('Telegram dispatch failed:', err);
    }
  }

  // 2. Generic HTTP Webhook (Discord, Slack, Zapier, Make, or WhatsApp bridge)
  if (config.webhookUrl) {
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          payload,
          timestamp: new Date().toISOString(),
        }),
      });
      return { success: true, target: 'webhookUrl' };
    } catch (err) {
      console.error('Webhook dispatch failed:', err);
    }
  }

  return { success: false, reason: 'Webhook sent to mock/in-memory queue' };
}
