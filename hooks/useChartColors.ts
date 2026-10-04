'use client'
import { useEffect, useState } from 'react'
import { FALLBACK_CHART_COLORS, readChartColors, type ChartColors } from '@/lib/chartColors'

// Recharts recebe cores como string (props/JS), então o CSS não alcança os gráficos:
// lemos as variáveis e relemos quando o next-themes troca a classe do <html>.
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(FALLBACK_CHART_COLORS)

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setColors(readChartColors(root))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return colors
}
