import { describe, it, expect } from 'vitest'
import { groupTopCategories } from '@/lib/chartColors'

const item = (name: string, value: number) => ({ name, value })

describe('groupTopCategories', () => {
  it('lista vazia devolve lista vazia', () => {
    expect(groupTopCategories([], 6)).toEqual([])
  })

  it('até o máximo de fatias mantém tudo, do maior para o menor', () => {
    const out = groupTopCategories([item('b', 10), item('a', 30), item('c', 20)], 6)
    expect(out.map((o) => o.name)).toEqual(['a', 'c', 'b'])
  })

  it('acima do máximo agrupa a cauda em "Outras" e nunca passa do máximo', () => {
    const entradas = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => item(`c${v}`, v))
    const out = groupTopCategories(entradas, 6)
    expect(out).toHaveLength(6)
    expect(out.slice(0, 5).map((o) => o.name)).toEqual(['c9', 'c8', 'c7', 'c6', 'c5'])
    expect(out[5]).toEqual({ name: 'Outras', value: 1 + 2 + 3 + 4 })
  })

  it('preserva o total', () => {
    const entradas = [5, 3, 9, 1, 7, 2, 8, 4].map((v, i) => item(`c${i}`, v))
    const total = (xs: { value: number }[]) => xs.reduce((s, x) => s + x.value, 0)
    expect(total(groupTopCategories(entradas, 6))).toBe(total(entradas))
  })

  it('exatamente no máximo não cria "Outras"', () => {
    const entradas = [1, 2, 3, 4, 5, 6].map((v) => item(`c${v}`, v))
    expect(groupTopCategories(entradas, 6).some((o) => o.name === 'Outras')).toBe(false)
  })
})
