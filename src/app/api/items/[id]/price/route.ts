import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { price, note, simulateDropPercentage } = body;

    const currentItem = await db.getItemById(id);
    if (!currentItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    let newPrice: number;
    let priceNote = note;

    if (simulateDropPercentage) {
      // Simulate drop e.g. 10%, 15%, 25% for BBD/GIF sale
      const dropFactor = 1 - Number(simulateDropPercentage) / 100;
      newPrice = Math.round(currentItem.currentPrice * dropFactor);
      priceNote = `BBD / GIF Flash Deal (-${simulateDropPercentage}%)`;
    } else if (price !== undefined) {
      newPrice = Number(price);
    } else {
      return NextResponse.json({ error: 'Either price or simulateDropPercentage must be provided' }, { status: 400 });
    }

    const updated = await db.addPricePoint(id, newPrice, priceNote);
    return NextResponse.json({ item: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating price point';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
