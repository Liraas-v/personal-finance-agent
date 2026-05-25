// app/api/ai/status/route.ts
import { NextResponse } from 'next/server'
import { getAIProvider } from '@/services/ai'

export async function GET() {
  const status = await getAIProvider().status()
  return NextResponse.json(status)
}
