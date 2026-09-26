import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { emoji, memberId } = body;

    if (!emoji || !memberId) {
      return NextResponse.json({ error: 'Emoji and memberId are required' }, { status: 400 });
    }

    const reactions = await db.toggleReaction(id, emoji, memberId);
    if (!reactions) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ reactions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error toggling reaction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
