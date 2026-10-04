import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChartColors } from '@/hooks/useChartColors'
import { FALLBACK_CHART_COLORS } from '@/lib/chartColors'

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.className = ''
})

describe('useChartColors', () => {
  it('começa lendo as variáveis atuais do CSS', async () => {
    document.documentElement.style.setProperty('--chart-primary', '#123456')
    const { result } = renderHook(() => useChartColors())
    await waitFor(() => expect(result.current.primary).toBe('#123456'))
  })

  it('relê as cores quando a classe do <html> muda (troca de tema)', async () => {
    const { result } = renderHook(() => useChartColors())
    expect(result.current.primary).toBe(FALLBACK_CHART_COLORS.primary)

    await act(async () => {
      document.documentElement.style.setProperty('--chart-primary', '#abcdef')
      document.documentElement.className = 'dark'
    })

    await waitFor(() => expect(result.current.primary).toBe('#abcdef'))
  })
})
