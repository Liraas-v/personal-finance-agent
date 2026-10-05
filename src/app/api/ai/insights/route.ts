// app/api/ai/insights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/services/ai'
import { aiErrorResponse } from '@/services/ai/http'

export async function POST(request: NextRequest) {
  const { summary } = await request.json()
  try {
    const insights = await getAIProvider().generateInsights(summary)
    return NextResponse.json({ insights })
  } catch (e) {
    return aiErrorResponse(e)
  }
}
