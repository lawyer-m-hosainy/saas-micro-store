export interface OrderNotificationData {
  id: string;
  productTitle: string;
  buyerName: string;
  buyerPhone: string;
  amountEgp: number;
}

/** يبني نص التنبيه المشترك لطلب جديد (يُستخدم لكل من Discord وTelegram) */
export function buildOrderAlertText(order: OrderNotificationData): string {
  return `طلب جديد 🎉\nالأداة: ${order.productTitle}\nالمبلغ: ${order.amountEgp} ج.م\nالمشتري: ${order.buyerName} (${order.buyerPhone})\nرقم الطلب: ${order.id}`;
}

function buildDiscordPayload(text: string): object {
  return { content: `🚨 ${text}` };
}

async function sendToDiscord(webhookUrl: string, text: string): Promise<void> {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildDiscordPayload(text)),
  });
}

async function sendToTelegram(botToken: string, chatId: string, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

/** يرسل تنبيه فوري لصاحب المتجر عبر Discord و/أو Telegram عند وصول طلب جديد (لا يوقف تنفيذ الطلب لو فشل الإرسال) */
export async function notifyNewOrder(order: OrderNotificationData): Promise<void> {
  const text = buildOrderAlertText(order);
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  const tasks: Promise<void>[] = [];
  if (discordWebhook) {
    tasks.push(sendToDiscord(discordWebhook, text).catch((err) => {
      console.error('Failed to send Discord order notification:', err);
    }));
  }
  if (telegramToken && telegramChatId) {
    tasks.push(sendToTelegram(telegramToken, telegramChatId, text).catch((err) => {
      console.error('Failed to send Telegram order notification:', err);
    }));
  }
  await Promise.all(tasks);
}
