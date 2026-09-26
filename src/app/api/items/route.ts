import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WishlistItem } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('member');
    const retailer = searchParams.get('retailer');
    const saleTag = searchParams.get('sale');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();
    const sort = searchParams.get('sort') || 'recent'; // 'recent', 'price_asc', 'price_desc', 'discount', 'drop'

    let items = await db.getItems();

    // Filters
    if (memberId && memberId !== 'all') {
      items = items.filter((item) => item.addedBy === memberId || item.splitWith?.includes(memberId));
    }

    if (retailer && retailer !== 'all') {
      items = items.filter((item) => item.retailer === retailer);
    }

    if (saleTag && saleTag !== 'all') {
      items = items.filter((item) => item.saleTag === saleTag);
    }

    if (status && status !== 'all') {
      items = items.filter((item) => item.status === status);
    }

    if (search) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search) ||
          item.addedByName.toLowerCase().includes(search) ||
          item.notes?.toLowerCase().includes(search)
      );
    }

    // Sort
    items = [...items].sort((a, b) => {
      if (sort === 'price_asc') return a.currentPrice - b.currentPrice;
      if (sort === 'price_desc') return b.currentPrice - a.currentPrice;
      if (sort === 'discount') {
        const discA = a.originalPrice ? (a.originalPrice - a.currentPrice) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.currentPrice) / b.originalPrice : 0;
        return discB - discA;
      }
      if (sort === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      // default: recent
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching items';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      url,
      imageUrl,
      retailer,
      category,
      addedBy,
      addedByName,
      currentPrice,
      originalPrice,
      targetPrice,
      priority,
      status,
      saleTag,
      notes,
      splitWith,
      isSecretGiftFor,
    } = body;

    if (!title || !url || currentPrice === undefined) {
      return NextResponse.json({ error: 'Title, URL, and Current Price are required' }, { status: 400 });
    }

    const priceNum = Number(currentPrice);
    const origPriceNum = originalPrice ? Number(originalPrice) : priceNum;

    const allMembers = await db.getMembers();
    const resolvedName = addedByName || allMembers.find((m) => m.id === (addedBy || 'member-1'))?.name || 'Pravin';

    const newItem = await db.addItem({
      title,
      url,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      retailer: retailer || 'other',
      category: category || 'Electronics',
      addedBy: addedBy || 'member-1',
      addedByName: resolvedName,
      currentPrice: priceNum,
      originalPrice: origPriceNum,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      lowestPrice: priceNum,
      highestPrice: Math.max(priceNum, origPriceNum),
      status: status || 'want',
      saleTag: saleTag || 'none',
      notes: notes || '',
      priority: priority || 'medium',
      splitWith: Array.isArray(splitWith) ? splitWith : [],
      isSecretGiftFor: isSecretGiftFor || undefined,
      inStock: true,
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
