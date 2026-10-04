import { describe, it, expect, afterEach } from 'vitest'
import { readChartColors, categoryColor, FALLBACK_CHART_COLORS } from '@/lib/chartColors'

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
    const c = readChartColors(el)
    expect(c.primary).toBe('#112233')
    expect(c.neutral).toBe('#445566')
    expect(c.grid).toBe('#778899')
    expect(c.axis).toBe('#aabbcc')
    expect(c.surface).toBe('#ddeeff')
    expect(c.text).toBe('#010203')
    expect(c.categories[0]).toBe('#0a0a0a')
  })

  it('usa o fallback quando a variável não existe', () => {
    const c = readChartColors(document.documentElement)
    expect(c).toEqual(FALLBACK_CHART_COLORS)
  })
})

describe('categoryColor', () => {
  const colors = FALLBACK_CHART_COLORS

  it('devolve a cor do índice', () => {
    expect(categoryColor(colors, 0)).toBe(colors.categories[0])
  })

  it('repete a última cor quando há mais categorias que cores', () => {
    const ultimo = colors.categories[colors.categories.length - 1]
    expect(categoryColor(colors, 6)).toBe(ultimo)
    expect(categoryColor(colors, 50)).toBe(ultimo)
  })

  it('nunca devolve undefined para índices válidos', () => {
    for (let i = 0; i < 20; i++) expect(categoryColor(colors, i)).toMatch(/^#[0-9a-f]{6}$/i)
  })
})
