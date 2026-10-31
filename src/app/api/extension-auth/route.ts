import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({ success: true, authorized: false });
}

export function POST() {
  return NextResponse.json({ success: true, authorized: false });
}
