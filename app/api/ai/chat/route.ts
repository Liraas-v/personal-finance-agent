// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/services/ai'
import { buildChatPrompt } from '@/services/ai/promptBuilder'
import type { TransactionSummary } from '@/types'

export async function POST(request: NextRequest) {
  const { message, context }: { message: string; context?: TransactionSummary } = await request.json()
  const prompt = buildChatPrompt(message, context)

  try {
    const reply = await getAIProvider().chat(prompt)
    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json(
      { error: 'IA não está disponível no momento.' },
      { status: 503 }
    )
  }
}
