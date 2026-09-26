import { NextRequest, NextResponse } from 'next/server';
import { sendWebhookAlert } from '@/lib/webhook';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookUrl, telegramBotToken, telegramChatId } = body;

    const data = await db.getData();
    if (webhookUrl !== undefined || telegramBotToken !== undefined || telegramChatId !== undefined) {
      data.webhookConfig = {
        enabled: true,
        type: telegramBotToken ? 'telegram' : 'whatsapp',
        webhookUrl,
        telegramBotToken,
        telegramChatId,
      };
      await db.saveData(data);
    }

    const testResult = await sendWebhookAlert(
      {
        itemTitle: 'Apple iPhone 16 (128 GB) - Ultramarine Blue',
        price: 64999,
        originalPrice: 79900,
        lowestPrice: 64999,
        url: 'https://www.flipkart.com',
        retailer: 'flipkart',
        alertType: 'target_met',
        addedBy: 'Pravin',
      },
      data.webhookConfig
    );

    return NextResponse.json({ success: true, testResult, config: data.webhookConfig });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook test failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
