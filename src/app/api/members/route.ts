import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const members = await db.getMembers();
    const items = await db.getItems();

    // Calculate dynamic stats
    const totalItems = items.length;
    const totalPotentialSavings = items.reduce((acc, item) => {
      const discount = Math.max(0, item.originalPrice - item.currentPrice);
      return acc + discount;
    }, 0);
    const bbdTargets = items.filter((i) => i.saleTag === 'bbd').length;
    const gifTargets = items.filter((i) => i.saleTag === 'gif').length;
    const orderedCount = items.filter((i) => i.status === 'ordered' || i.status === 'received').length;

    return NextResponse.json({
      members,
      groupStats: {
        totalItems,
        totalPotentialSavings,
        bbdTargets,
        gifTargets,
        orderedCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching members';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, pin } = body;

    if (!memberId || !pin) {
      return NextResponse.json({ error: 'Member and PIN are required' }, { status: 400 });
    }

    const member = await db.authenticate(memberId, pin);
    if (!member) {
      return NextResponse.json({ error: 'Invalid PIN or unauthorized member' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        shortName: member.shortName,
        avatar: member.avatar,
        color: member.color,
        role: member.role,
        bio: member.bio,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, cards } = body;

    if (!memberId || !Array.isArray(cards)) {
      return NextResponse.json({ error: 'memberId and cards array are required' }, { status: 400 });
    }

    const updatedMember = await db.updateMemberCards(memberId, cards);
    if (!updatedMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update cards';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
