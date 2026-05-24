import { describe, it, expect } from 'vitest'
import { buildChatPrompt } from '@/services/ai/promptBuilder'

describe('buildChatPrompt', () => {
  it('monta um prompt genérico quando não há contexto', () => {
    const prompt = buildChatPrompt('Como economizar mais?')
    expect(prompt).toContain('consultor financeiro pessoal')
    expect(prompt).toContain('Como economizar mais?')
  })

  it('inclui os dados financeiros formatados quando há contexto', () => {
    const prompt = buildChatPrompt('Como estou indo?', {
      periodo: { from: '2026-08-01', to: '2026-08-31' },
      totalGastos: 1000,
      totalReceitas: 2000,
      saldo: 1000,
      porCategoria: { Alimentação: 400 },
      moeda: 'BRL',
    })

    expect(prompt).toContain('R$')
    expect(prompt).toContain('Alimentação: R$')
    expect(prompt).toContain('Como estou indo?')
  })
})
