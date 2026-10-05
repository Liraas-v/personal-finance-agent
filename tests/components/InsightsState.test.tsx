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

  it('erro mostra a causa específica quando o motivo é conhecido', () => {
    render(<InsightsState status="error" hasTransactions onRetry={vi.fn()} reason="timeout" />)
    expect(screen.getByText('A IA demorou demais para responder.')).toBeInTheDocument()
  })

  it('empty significa que a IA respondeu sem itens: sem botão de nova tentativa', () => {
    render(<InsightsState status="empty" hasTransactions onRetry={vi.fn()} />)
    expect(screen.getByText('Nenhum insight para este período.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })

  it('ready e loading não renderizam nada', () => {
    for (const status of ['ready', 'loading'] as const) {
      const { container, unmount } = render(<InsightsState status={status} hasTransactions onRetry={vi.fn()} />)
      expect(container).toBeEmptyDOMElement()
      unmount()
    }
  })
})
