// app/api/ai/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/services/ai'

export async function POST(request: NextRequest) {
  const { text } = await request.json()
  const result = await getAIProvider().analyzeExpense(text)
  return NextResponse.json(result)
}
