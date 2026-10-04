export interface ChartColors {
  primary: string
  neutral: string
  grid: string
  axis: string
  surface: string
  border: string
  text: string
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
  categories: ['#c3d0de', '#a9bbcf', '#8fa8c2', '#7790ab', '#657d97', '#5a7289'],
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

export function categoryColor(colors: ChartColors, index: number): string {
  return colors.categories[Math.min(Math.max(index, 0), colors.categories.length - 1)]
}

// O donut só tem 6 tons distintos: as categorias além disso viram uma fatia "Outras",
// em vez de repetir a mesma cor em fatias diferentes.
export function groupTopCategories(
  entries: { name: string; value: number }[],
  max: number,
): { name: string; value: number }[] {
  const sorted = [...entries].sort((a, b) => b.value - a.value)
  if (sorted.length <= max) return sorted
  const top = sorted.slice(0, max - 1)
  const rest = sorted.slice(max - 1).reduce((sum, e) => sum + e.value, 0)
  return [...top, { name: 'Outras', value: rest }]
}
