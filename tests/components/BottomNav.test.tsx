import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

let pathname = '/dashboard'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'system', setTheme: vi.fn() }) }))

import { BottomNav } from '@/components/layout/BottomNav'

describe('BottomNav', () => {
  it('mantém as 4 abas principais e o botão Mais', () => {
    render(<BottomNav />)
    for (const nome of ['Dashboard', 'Transações', 'Metas', 'Chat']) {
      expect(screen.getByRole('link', { name: nome })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Mais' })).toBeInTheDocument()
  })

  it('Mais abre um painel com Insights, OCR, Configurações e o seletor de tema', () => {
    render(<BottomNav />)
    fireEvent.click(screen.getByRole('button', { name: 'Mais' }))
    expect(screen.getByRole('link', { name: 'Insights' })).toHaveAttribute('href', '/insights')
    expect(screen.getByRole('link', { name: 'OCR' })).toHaveAttribute('href', '/ocr')
    expect(screen.getByRole('link', { name: 'Configurações' })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('group', { name: 'Tema' })).toBeInTheDocument()
  })

  it('Mais aparece ativo quando a página atual é uma das dele', () => {
    pathname = '/ocr'
    render(<BottomNav />)
    expect(screen.getByRole('button', { name: 'Mais' }).className).toContain('text-primary')
    pathname = '/dashboard'
  })
})
