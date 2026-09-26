import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CardOfferRecommendation, Member } from '@/types';

export async function GET() {
  try {
    const items = await db.getItems();
    const cartItems = items.filter((i) => i.inCommonCart);
    const members = await db.getMembers();

    const subtotal = cartItems.reduce((acc, i) => acc + i.currentPrice * (i.cartQuantity || 1), 0);
    const totalMrp = cartItems.reduce((acc, i) => acc + i.originalPrice * (i.cartQuantity || 1), 0);
    const rawSavings = Math.max(0, totalMrp - subtotal);

    // Calculate Best Card Offer Recommendation dynamically ONLY from cards actually entered by members
    const cardOptions: CardOfferRecommendation[] = [];

    members.forEach((m) => {
      if (m.cardsHeld && m.cardsHeld.length > 0) {
        m.cardsHeld.forEach((card) => {
          const lower = card.toLowerCase();
          let pct = 5;
          let cap: number | undefined = undefined;

          if (lower.includes('10%') || lower.includes('regalia') || lower.includes('sbi')) {
            pct = 10;
            cap = 1500;
          } else if (lower.includes('7.5%')) {
            pct = 7.5;
            cap = 1000;
          } else if (lower.includes('5%') || lower.includes('axis') || lower.includes('icici') || lower.includes('millennia') || lower.includes('cashback')) {
            pct = 5;
          }

          const rawDisc = Math.round(subtotal * (pct / 100));
          const discountAmount = cap ? Math.min(cap, rawDisc) : rawDisc;

          cardOptions.push({
            cardName: `${m.name}’s ${card}`,
            memberId: m.id,
            memberName: m.name,
            discountPercentage: pct,
            maxDiscount: cap,
            discountAmount,
            finalPrice: Math.max(0, subtotal - discountAmount),
            badge: `${pct}% Discount ✨`,
          });
        });
      }
    });

    cardOptions.sort((a, b) => b.discountAmount - a.discountAmount);
    const bestCard = cardOptions.length > 0 ? cardOptions[0] : null;

    return NextResponse.json({
      cartItems,
      totalCount: cartItems.length,
      subtotal,
      totalMrp,
      rawSavings,
      bestCard,
      cardOptions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error retrieving cart';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, inCart, quantity } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const updated = await db.toggleCommonCart(itemId, inCart, quantity);

    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating cart';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
