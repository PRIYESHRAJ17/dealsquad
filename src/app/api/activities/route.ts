import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const activities = await db.getActivities();
    return NextResponse.json({ activities });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching activities';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
