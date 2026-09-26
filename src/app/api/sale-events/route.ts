import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const saleEvents = await db.getSaleEvents();
    return NextResponse.json({ saleEvents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching sale events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
