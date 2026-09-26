import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const activities = await db.getActivities();
    return NextResponse.json({ activities });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching activities';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.clearActivities();
    return NextResponse.json({ success: true, activities: [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error clearing activities';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
