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

  it('há uma cor para cada categoria padrão (exceto "Outros") e 12 no total', () => {
    expect(FALLBACK_CHART_COLORS.categories.length).toBeGreaterThanOrEqual(ALL_CATEGORIES.filter((c) => c !== 'Outros').length)
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

describe('categoryColor — categorias do usuário', () => {
  const colors = FALLBACK_CHART_COLORS
  const padrao = ALL_CATEGORIES.filter((c) => c !== 'Outros')

  it('o fallback tem 12 cores', () => {
    expect(colors.categories).toHaveLength(12)
  })

  it('as 8 padrão mantêm exatamente as cores de antes (regressão)', () => {
    const antes = ['#f0993a', '#5b9bd5', '#62b857', '#b987c9', '#ee7fb2', '#54c1b8', '#e3c63f', '#ee5d58']
    padrao.forEach((nome, i) => expect(categoryColor(colors, nome)).toBe(antes[i]))
    padrao.forEach((nome, i) => expect(categoryColor(colors, nome, [...padrao, 'Outros'])).toBe(antes[i]))
  })

  it('a primeira categoria nova recebe a 9ª cor', () => {
    expect(categoryColor(colors, 'Pets', [...padrao, 'Pets', 'Outros'])).toBe(colors.categories[8])
  })

  it('"Outros" no meio da lista não ocupa posição', () => {
    expect(categoryColor(colors, 'Pets', ['Outros', 'Pets'])).toBe(colors.categories[0])
  })

  it('remover uma categoria do meio faz as seguintes subirem (limitação conhecida)', () => {
    const semTransporte = padrao.filter((c) => c !== 'Transporte')
    expect(categoryColor(colors, 'Saúde', semTransporte)).toBe(colors.categories[1])
  })

  it('além da 12ª posição, e nomes fora da lista, ficam neutros', () => {
    const treze = Array.from({ length: 13 }, (_, i) => `C${i + 1}`)
    expect(categoryColor(colors, 'C12', treze)).toBe(colors.categories[11])
    expect(categoryColor(colors, 'C13', treze)).toBe(colors.neutral)
    expect(categoryColor(colors, 'Fora', treze)).toBe(colors.neutral)
  })
})

describe('readChartColors — 12 categorias', () => {
  it('lê --cat-9 … --cat-12', () => {
    const el = document.documentElement
    el.style.setProperty('--cat-9', '#010101')
    el.style.setProperty('--cat-12', '#020202')
    const c = readChartColors(el)
    expect(c.categories[8]).toBe('#010101')
    expect(c.categories[11]).toBe('#020202')
  })
})

