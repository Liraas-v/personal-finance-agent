import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/repositories', () => ({ getConfigRepository: () => ({ update: vi.fn() }) }))

import { useFinanceStore } from '@/lib/store'
import { MetasSection } from '@/components/settings/MetasSection'

beforeEach(() => useFinanceStore.setState({ config: null }))

describe('MetasSection', () => {
  it('com o config ainda nulo não mostra um campo com 0', () => {
    render(<MetasSection />)
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('quando o config chega mostra a meta real', () => {
    render(<MetasSection />)
    act(() => {
      useFinanceStore.setState({ config: { moeda: 'BRL', metaEconomia: 1500, limitesPorCategoria: {} } as never })
    })
    expect(screen.getByRole('spinbutton')).toHaveValue(1500)
  })

  it('com o config já carregado mostra a meta na primeira renderização', () => {
    useFinanceStore.setState({ config: { moeda: 'USD', metaEconomia: 800, limitesPorCategoria: {} } as never })
    render(<MetasSection />)
    expect(screen.getByRole('spinbutton')).toHaveValue(800)
  })
})
