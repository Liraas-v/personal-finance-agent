// app/api/ai/models/route.ts
import { NextResponse } from 'next/server'
import { getAIProvider } from '@/services/ai'

export async function GET() {
  const models = await getAIProvider().listModels()
  return NextResponse.json({ models })
}
