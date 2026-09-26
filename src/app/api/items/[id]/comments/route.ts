import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { authorId, authorName, authorAvatar, authorColor, content, tag, targetMemberId } = body;

    if (!content || !authorId) {
      return NextResponse.json({ error: 'Comment content and author are required' }, { status: 400 });
    }

    const comment = await db.addComment(id, {
      authorId,
      authorName: authorName || 'Member',
      authorAvatar: authorAvatar || '',
      authorColor: authorColor || '#3b82f6',
      content,
      tag: tag || 'note',
      targetMemberId,
    });

    if (!comment) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error adding comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
