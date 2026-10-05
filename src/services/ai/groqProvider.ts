import type { TransactionSummary, ParsedTransaction } from '@/types'
import type { AIProvider } from './types'
import { AIProviderError, toAIProviderError } from './errors'
import { ALL_CATEGORIES } from '@/lib/categories'
import { parseExpense, parseInsights } from './parse'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
// llama-3.1-8b-instant e llama-3.3-70b-versatile foram desativados pela Groq em
// 16/08/2026 (console.groq.com/docs/deprecations). Migração recomendada pela Groq
// pro 8b: openai/gpt-oss-20b — mesma faixa de custo/velocidade, com suporte a
// response_format json_object usado em analyzeExpense/generateInsights.
const GROQ_MODEL = 'openai/gpt-oss-20b'

async function groqComplete(prompt: string, jsonMode = false): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new AIProviderError('missing_key', 'GROQ_API_KEY não configurada')

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    })

    if (!res.ok) throw new AIProviderError('http', `Groq HTTP ${res.status}`, res.status)
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  } catch (e) {
    throw toAIProviderError(e)
  }
}

export class GroqProvider implements AIProvider {
  async chat(prompt: string): Promise<string> {
    return groqComplete(prompt)
  }

  async analyzeExpense(text: string, categorias?: string[]): Promise<ParsedTransaction> {
    const prompt = `Analise este gasto e retorne APENAS um JSON com campos categoria, descricao, pagamento.
Categorias válidas: ${(categorias?.length ? categorias : ALL_CATEGORIES).join(', ')}.
Formas de pagamento: crédito, débito, pix, dinheiro, parcelado.
Texto: "${text}"`
    return parseExpense(await groqComplete(prompt, true))
  }

  async generateInsights(summary: TransactionSummary): Promise<string[]> {
    const prompt = `Analise este resumo financeiro e gere de 3 a 5 insights curtos em português.
Dados: ${JSON.stringify(summary, null, 2)}
Use os valores reais. Seja direto e específico.
Retorne APENAS um JSON no formato {"insights": ["insight 1", "insight 2"]}`
    return parseInsights(await groqComplete(prompt, true))
  }

  async status(): Promise<{ online: boolean; model: string; loaded?: boolean }> {
    if (!process.env.GROQ_API_KEY) return { online: false, model: GROQ_MODEL }
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        signal: AbortSignal.timeout(5_000),
      })
      return { online: res.ok, model: GROQ_MODEL }
    } catch {
      return { online: false, model: GROQ_MODEL }
    }
  }

  async listModels(): Promise<string[]> {
    return ['openai/gpt-oss-20b', 'openai/gpt-oss-120b']
  }
}
