import { readConfig } from '@/lib/db'
import type { TransactionSummary, ParsedTransaction } from '@/types'
import type { AIProvider } from './types'
import { AIProviderError, toAIProviderError } from './errors'
import { parseExpense, parseInsights } from './parse'

async function ollamaGenerate(prompt: string, url: string, model: string, json = false): Promise<string> {
  try {
    const res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false, ...(json ? { format: 'json' } : {}) }),
      signal: AbortSignal.timeout(json ? 15_000 : 30_000),
    })
    if (!res.ok) throw new AIProviderError('http', `Ollama HTTP ${res.status}`, res.status)
    const data = await res.json()
    return (data.response as string) ?? ''
  } catch (e) {
    throw toAIProviderError(e)
  }
}

export class OllamaProvider implements AIProvider {
  async chat(prompt: string): Promise<string> {
    const { ollama } = readConfig()
    return ollamaGenerate(prompt, ollama.url, ollama.model)
  }

  async analyzeExpense(text: string): Promise<ParsedTransaction> {
    const { ollama } = readConfig()
    const prompt = `Analise este gasto e retorne JSON com campos categoria, descricao, pagamento.
Categorias válidas: Alimentação, Transporte, Saúde, Assinaturas, Compras, Moradia, Educação, Lazer, Outros.
Formas de pagamento: crédito, débito, pix, dinheiro, parcelado.
Texto: "${text}"
Retorne apenas o JSON.`
    return parseExpense(await ollamaGenerate(prompt, ollama.url, ollama.model, true))
  }

  async generateInsights(summary: TransactionSummary): Promise<string[]> {
    const { ollama } = readConfig()
    const prompt = `Analise este resumo financeiro e gere de 3 a 5 insights curtos em português.
Dados: ${JSON.stringify(summary, null, 2)}
Use os valores reais. Seja direto e específico.
Retorne JSON array de strings, ex: ["insight 1", "insight 2"]`
    return parseInsights(await ollamaGenerate(prompt, ollama.url, ollama.model, true))
  }

  async status(): Promise<{ online: boolean; model: string; loaded?: boolean }> {
    const { ollama } = readConfig()
    try {
      const res = await fetch(`${ollama.url}/api/tags`, { signal: AbortSignal.timeout(5_000) })
      if (!res.ok) return { online: false, model: ollama.model }
      const data = await res.json()
      const models: string[] = (data.models ?? []).map((m: { name: string }) => m.name)
      return { online: true, model: ollama.model, loaded: models.some((m) => m.startsWith(ollama.model)) }
    } catch {
      return { online: false, model: ollama.model }
    }
  }

  async listModels(): Promise<string[]> {
    const { ollama } = readConfig()
    try {
      const res = await fetch(`${ollama.url}/api/tags`, { signal: AbortSignal.timeout(5_000) })
      if (!res.ok) return []
      const data = await res.json()
      return (data.models ?? []).map((m: { name: string }) => m.name)
    } catch {
      return []
    }
  }
}
