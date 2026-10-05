import { ALL_CATEGORIES } from '@/lib/categories'

export interface ChartColors {
  primary: string
  neutral: string
  grid: string
  axis: string
  surface: string
  border: string
  text: string
  /** Uma cor por categoria conhecida, na ordem de ALL_CATEGORIES sem "Outros" (--cat-1 … --cat-8). */
  categories: string[]
}

// Valores do tema escuro: usados no servidor e antes da primeira leitura do CSS.
export const FALLBACK_CHART_COLORS: ChartColors = {
  primary: '#8fa8c2',
  neutral: '#6b707a',
  grid: '#2a2c31',
  axis: '#8b8f98',
  surface: '#17181b',
  border: '#2a2c31',
  text: '#b4b7be',
  categories: ['#f0993a', '#5b9bd5', '#62b857', '#b987c9', '#ee7fb2', '#54c1b8', '#e3c63f', '#ee5d58'],
}

const CATEGORIAS_COM_COR = ALL_CATEGORIES.filter((c) => c !== 'Outros')

export function readChartColors(el: Element): ChartColors {
  const style = getComputedStyle(el)
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback
  const f = FALLBACK_CHART_COLORS
  return {
    primary: read('--chart-primary', f.primary),
    neutral: read('--chart-neutral', f.neutral),
    grid: read('--border', f.grid),
    axis: read('--muted-foreground', f.axis),
    surface: read('--card', f.surface),
    border: read('--border', f.border),
    text: read('--foreground-secondary', f.text),
    categories: f.categories.map((fallback, i) => read(`--cat-${i + 1}`, fallback)),
  }
}

// A cor depende do NOME da categoria, não da posição na lista: "Alimentação" é sempre a mesma cor,
// em qualquer gráfico, com 3 ou com 8 categorias à mostra. "Outros" e nomes desconhecidos ficam neutros.
export function categoryColor(colors: ChartColors, name: string): string {
  const i = CATEGORIAS_COM_COR.indexOf(name)
  return i === -1 ? colors.neutral : colors.categories[i]
}
