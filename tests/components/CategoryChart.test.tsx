import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { FALLBACK_CHART_COLORS, categoryColor } from '@/lib/chartColors'

let porCategoria: Record<string, number> = {}
vi.mock('@/hooks/useTransactions', () => ({ useTransactions: () => ({ porCategoria }) }))
vi.mock('@/hooks/useChartColors', () => ({ useChartColors: () => FALLBACK_CHART_COLORS }))

import { CategoryChart } from '@/components/dashboard/CategoryChart'

beforeEach(() => {
  porCategoria = {}
})

describe('CategoryChart', () => {
  it('sem gastos mostra o estado vazio e nenhuma legenda', () => {
    render(<CategoryChart />)
    expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('a legenda lista cada categoria com o seu percentual, da maior para a menor', () => {
    porCategoria = { Lazer: 100, Alimentação: 600, Moradia: 300 }
    render(<CategoryChart />)
    const itens = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(itens.map((li) => li.textContent)).toEqual(['Alimentação60%', 'Moradia30%', 'Lazer10%'])
  })

  it('cada item usa a cor fixa da sua categoria', () => {
    porCategoria = { Lazer: 100, Alimentação: 600 }
    render(<CategoryChart />)
    for (const nome of ['Lazer', 'Alimentação']) {
      const li = screen.getByText(nome).closest('li') as HTMLElement
      const swatch = li.querySelector('[data-swatch]') as HTMLElement
      expect(swatch.style.backgroundColor).not.toBe('')
      expect(swatch.getAttribute('data-color')).toBe(categoryColor(FALLBACK_CHART_COLORS, nome))
    }
  })

  it('o item mantém a mesma cor mesmo com outra quantidade de categorias', () => {
    porCategoria = { Lazer: 1 }
    const { unmount } = render(<CategoryChart />)
    const sozinha = (screen.getByText('Lazer').closest('li') as HTMLElement).querySelector('[data-swatch]')!.getAttribute('data-color')
    unmount()
    porCategoria = { Lazer: 1, Alimentação: 5, Saúde: 3, Moradia: 9, Compras: 2 }
    render(<CategoryChart />)
    const junto = (screen.getByText('Lazer').closest('li') as HTMLElement).querySelector('[data-swatch]')!.getAttribute('data-color')
    expect(junto).toBe(sozinha)
  })

  it('fatia abaixo de 1% aparece como "<1%" e nunca como 0%', () => {
    porCategoria = { Moradia: 10000, Lazer: 1 }
    render(<CategoryChart />)
    expect((screen.getByText('Lazer').closest('li') as HTMLElement).textContent).toBe('Lazer<1%')
  })
})
