import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InsightsState } from '@/components/insights/InsightsState'

describe('InsightsState', () => {
  it('sem transações pede para adicionar transações', () => {
    render(<InsightsState status="idle" hasTransactions={false} onRetry={vi.fn()} />)
    expect(screen.getByText(/Adicione transações para gerar insights/)).toBeInTheDocument()
  })

  it('com transações nunca pede para adicionar transações', () => {
    for (const status of ['idle', 'empty', 'error'] as const) {
      const { unmount } = render(<InsightsState status={status} hasTransactions onRetry={vi.fn()} />)
      expect(screen.queryByText(/Adicione transações/)).not.toBeInTheDocument()
      unmount()
    }
  })

  it('erro mostra a mensagem e o botão de nova tentativa', () => {
    const onRetry = vi.fn()
    render(<InsightsState status="error" hasTransactions onRetry={onRetry} />)
    expect(screen.getByText(/A IA não está disponível agora/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('empty também oferece nova tentativa (a IA pode ter falhado em silêncio)', () => {
    const onRetry = vi.fn()
    render(<InsightsState status="empty" hasTransactions onRetry={onRetry} />)
    expect(screen.getByText(/A IA não retornou insights desta vez/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('ready e loading não renderizam nada', () => {
    for (const status of ['ready', 'loading'] as const) {
      const { container, unmount } = render(<InsightsState status={status} hasTransactions onRetry={vi.fn()} />)
      expect(container).toBeEmptyDOMElement()
      unmount()
    }
  })
})
