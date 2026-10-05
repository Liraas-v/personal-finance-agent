import { CATEGORIAS_PADRAO } from '@/lib/customCategories'

export interface ChartColors {
  primary: string
  neutral: string
  grid: string
  axis: string
  surface: string
  border: string
  text: string
  /** Uma cor por posição na lista de categorias, sem "Outros" (--cat-1 … --cat-12). */
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
  categories: [
    '#f0993a', '#5b9bd5', '#62b857', '#b987c9', '#ee7fb2', '#54c1b8', '#e3c63f', '#ee5d58',
    '#e1b598', '#5f5fdd', '#b7c07c', '#cc5fdd',
  ],
}

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

// A cor segue a POSIÇÃO da categoria na lista (sem "Outros"): com a lista padrão, "Alimentação" é sempre
// a 1ª cor, "Transporte" a 2ª etc. Categorias criadas recebem as cores 9 a 12. Limitação conhecida:
// remover uma categoria do meio faz as seguintes subirem uma posição (e mudarem de cor). "Outros",
// nomes fora da lista e posições além de --cat-12 ficam neutros.
export function categoryColor(colors: ChartColors, name: string, categorias: string[] = CATEGORIAS_PADRAO): string {
  const i = categorias.filter((c) => c !== 'Outros').indexOf(name)
  return i === -1 || i >= colors.categories.length ? colors.neutral : colors.categories[i]
}
