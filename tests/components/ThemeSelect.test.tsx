import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const setTheme = vi.fn()
let mockTheme: string | undefined = 'system'

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: mockTheme, setTheme }),
}))

import { ThemeSelect } from '@/components/layout/ThemeSelect'

describe('ThemeSelect', () => {
  beforeEach(() => {
    setTheme.mockClear()
    mockTheme = 'system'
  })

  it('marca a opção do tema atual como pressionada', () => {
    render(<ThemeSelect />)
    expect(screen.getByRole('button', { name: 'Sistema' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Escuro' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('chama setTheme ao clicar', () => {
    render(<ThemeSelect />)
    fireEvent.click(screen.getByRole('button', { name: 'Escuro' }))
    expect(setTheme).toHaveBeenCalledWith('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Claro' }))
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('não quebra quando o tema ainda é undefined', () => {
    mockTheme = undefined
    render(<ThemeSelect />)
    for (const nome of ['Claro', 'Escuro', 'Sistema']) {
      expect(screen.getByRole('button', { name: nome })).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('mostra os rótulos quando showLabels', () => {
    render(<ThemeSelect showLabels />)
    expect(screen.getByText('Claro')).toBeInTheDocument()
  })
})
