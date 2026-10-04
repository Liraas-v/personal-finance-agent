import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const sendMessage = vi.fn()
let tts = true
vi.mock('@/hooks/useChat', () => ({
  useChat: () => ({ messages: [], loading: false, contextEnabled: true, toggleContext: vi.fn(), sendMessage, clearChat: vi.fn() }),
}))
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: vi.fn(), stop: vi.fn(), speakingMessageId: null, isSupported: tts }),
}))
vi.mock('@/hooks/useVoice', () => ({
  useVoice: () => ({ isListening: false, isSupported: false, toggle: vi.fn() }),
}))

import { ChatPanel } from '@/components/chat/ChatPanel'
import { CHAT_SUGGESTIONS } from '@/components/chat/ChatSuggestions'

beforeEach(() => {
  sendMessage.mockClear()
  tts = true
  Element.prototype.scrollIntoView = vi.fn()
})

describe('ChatPanel', () => {
  it('estado vazio oferece 4 sugestões de pergunta', () => {
    render(<ChatPanel />)
    expect(CHAT_SUGGESTIONS).toHaveLength(4)
    for (const s of CHAT_SUGGESTIONS) expect(screen.getByRole('button', { name: s })).toBeInTheDocument()
  })

  it('clicar numa sugestão envia aquela pergunta', () => {
    render(<ChatPanel />)
    fireEvent.click(screen.getByRole('button', { name: CHAT_SUGGESTIONS[0] }))
    expect(sendMessage).toHaveBeenCalledWith(CHAT_SUGGESTIONS[0])
  })

  it('resposta por voz é um botão de ícone com aria-pressed, sem barra "Responder por voz" separada', () => {
    render(<ChatPanel />)
    const botao = screen.getByRole('button', { name: 'Responder por voz' })
    expect(botao).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(botao)
    expect(botao).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Responder por voz automaticamente')).not.toBeInTheDocument()
  })

  it('sem suporte a fala o botão de voz não aparece', () => {
    tts = false
    render(<ChatPanel />)
    expect(screen.queryByRole('button', { name: 'Responder por voz' })).not.toBeInTheDocument()
  })
})
