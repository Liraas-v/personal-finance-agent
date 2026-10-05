// app/api/ai/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/services/ai'

export async function POST(request: NextRequest) {
  const { text } = await request.json()
  try {
    return NextResponse.json(await getAIProvider().analyzeExpense(text))
  } catch {
    // Sem IA a voz e o formulário continuam funcionando: cai em "Outros" e sinaliza a degradação.
    return NextResponse.json({ categoria: 'Outros', descricao: text, pagamento: 'crédito', degraded: true })
  }
}
