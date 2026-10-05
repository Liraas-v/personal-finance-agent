// app/api/ai/insights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/services/ai'

export async function POST(request: NextRequest) {
  const { summary } = await request.json()
  const insights = await getAIProvider().generateInsights(summary)
  return NextResponse.json({ insights })
}
