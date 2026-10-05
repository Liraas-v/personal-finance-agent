import { describe, it, expect, afterEach } from 'vitest'
import { readChartColors, categoryColor, FALLBACK_CHART_COLORS } from '@/lib/chartColors'
import { ALL_CATEGORIES } from '@/lib/categories'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('readChartColors', () => {
  it('lê as variáveis CSS do elemento', () => {
    const el = document.documentElement
    el.style.setProperty('--chart-primary', '#112233')
    el.style.setProperty('--chart-neutral', '#445566')
    el.style.setProperty('--border', '#778899')
    el.style.setProperty('--muted-foreground', '#aabbcc')
    el.style.setProperty('--card', '#ddeeff')
    el.style.setProperty('--foreground-secondary', '#010203')
    el.style.setProperty('--cat-1', '#0a0a0a')
    el.style.setProperty('--cat-8', '#0b0b0b')
    const c = readChartColors(el)
    expect(c.primary).toBe('#112233')
    expect(c.neutral).toBe('#445566')
    expect(c.grid).toBe('#778899')
    expect(c.axis).toBe('#aabbcc')
    expect(c.surface).toBe('#ddeeff')
    expect(c.text).toBe('#010203')
    expect(c.categories[0]).toBe('#0a0a0a')
    expect(c.categories[7]).toBe('#0b0b0b')
  })

  it('usa o fallback quando a variável não existe', () => {
    const c = readChartColors(document.documentElement)
    expect(c).toEqual(FALLBACK_CHART_COLORS)
  })

  it('há uma cor para cada categoria conhecida (exceto "Outros")', () => {
    expect(FALLBACK_CHART_COLORS.categories).toHaveLength(ALL_CATEGORIES.filter((c) => c !== 'Outros').length)
  })
})

describe('categoryColor', () => {
  const colors = FALLBACK_CHART_COLORS
  const conhecidas = ALL_CATEGORIES.filter((c) => c !== 'Outros')

  it('cada categoria conhecida tem a sua cor fixa, na ordem de ALL_CATEGORIES', () => {
    conhecidas.forEach((nome, i) => expect(categoryColor(colors, nome)).toBe(colors.categories[i]))
  })

  it('categorias diferentes nunca compartilham a mesma cor', () => {
    const cores = new Set(conhecidas.map((nome) => categoryColor(colors, nome)))
    expect(cores.size).toBe(conhecidas.length)
  })

  it('"Outros" e categorias desconhecidas usam a cor neutra', () => {
    expect(categoryColor(colors, 'Outros')).toBe(colors.neutral)
    expect(categoryColor(colors, 'Categoria inventada')).toBe(colors.neutral)
    expect(categoryColor(colors, '')).toBe(colors.neutral)
  })

  it('a cor independe da posição ou da quantidade de categorias exibidas', () => {
    expect(categoryColor(colors, 'Lazer')).toBe(categoryColor(colors, 'Lazer'))
    expect(categoryColor(colors, 'Lazer')).toBe(colors.categories[conhecidas.indexOf('Lazer')])
  })
})
