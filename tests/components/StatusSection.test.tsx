import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/hooks/useOllamaStatus', () => ({
  useOllamaStatus: () => ({ status: { online: true, model: 'm' }, loading: false }),
}))

import { StatusSection } from '@/components/settings/StatusSection'

afterEach(() => {
  delete (window as unknown as Record<string, unknown>).SpeechRecognition
})

describe('StatusSection', () => {
  it('mostra "Não suportado" quando o navegador não tem reconhecimento de voz', () => {
    render(<StatusSection />)
    expect(screen.getByText('Não suportado neste browser')).toBeInTheDocument()
  })

  it('mostra "Disponível" quando o navegador tem reconhecimento de voz', () => {
    ;(window as unknown as Record<string, unknown>).SpeechRecognition = function () {}
    render(<StatusSection />)
    expect(screen.getByText('Disponível')).toBeInTheDocument()
  })

  it('a primeira renderização (servidor) não depende de window', async () => {
    const { renderToString } = await import('react-dom/server')
    ;(window as unknown as Record<string, unknown>).SpeechRecognition = function () {}
    const html = renderToString(<StatusSection />)
    expect(html).toContain('Não suportado neste browser')
  })
})
