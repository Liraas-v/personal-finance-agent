// app/api/ai/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/services/ai'
import { ALL_CATEGORIES } from '@/lib/categories'
import { OUTROS, normalizarCategoria } from '@/lib/customCategories'

export async function POST(request: NextRequest) {
  const { text, categorias }: { text: string; categorias?: unknown } = await request.json()
  // A lista vem do cliente (a configuração do usuário); sem ela, valem as categorias padrão.
  const validas =
    Array.isArray(categorias) && categorias.some((c) => typeof c === 'string')
      ? Array.from(new Set([...categorias.filter((c): c is string => typeof c === 'string' && c.trim() !== ''), OUTROS]))
      : ALL_CATEGORIES
  try {
    const resultado = await getAIProvider().analyzeExpense(text, validas)
    // A IA pode sugerir uma categoria que não existe: a normalização vale para qualquer provider.
    return NextResponse.json({ ...resultado, categoria: normalizarCategoria(resultado.categoria, validas) })
  } catch {
    // Sem IA a voz e o formulário continuam funcionando: cai em "Outros" e sinaliza a degradação.
    return NextResponse.json({ categoria: 'Outros', descricao: text, pagamento: 'crédito', degraded: true })
  }
}
