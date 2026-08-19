import { describe, it, expect } from 'vitest'
import { buildDemoTransactions, demoConfig } from '@/lib/demoSeed'
import { ALL_CATEGORIES } from '@/lib/categories'

describe('demoSeed', () => {
  it('buildDemoTransactions gera datas relativas à data de referência', () => {
    const reference = new Date('2026-08-18T12:00:00.000Z')
    const transactions = buildDemoTransactions(reference)

    expect(transactions.length).toBeGreaterThan(20)
    expect(transactions.every((t) => new Date(t.data) <= reference)).toBe(true)
    expect(new Set(transactions.map((t) => t.id)).size).toBe(transactions.length)
  })

  it('cobre todas as categorias existentes', () => {
    const transactions = buildDemoTransactions(new Date('2026-08-18T12:00:00.000Z'))
    const categoriasUsadas = new Set(transactions.map((t) => t.categoria))
    for (const categoria of ALL_CATEGORIES) {
      if (categoria === 'Outros') continue
      expect(categoriasUsadas.has(categoria)).toBe(true)
    }
  })

  it('demoConfig define meta de economia e limites por categoria', () => {
    expect(demoConfig.metaEconomia).toBeGreaterThan(0)
    expect(Object.keys(demoConfig.limitesPorCategoria).length).toBeGreaterThan(0)
    expect(demoConfig.moeda).toBe('BRL')
  })
})
