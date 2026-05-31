import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeech } from '@/hooks/useSpeech'

const mockSpeak = vi.fn()
const mockCancel = vi.fn()
const mockGetVoices = vi.fn(() => [])
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

// Mock SpeechSynthesisUtterance which is not available in jsdom
class MockSpeechSynthesisUtterance {
  text: string
  lang: string = ''
  pitch: number = 1
  rate: number = 1
  voice: SpeechSynthesisVoice | null = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
  writable: true,
  configurable: true,
})

// Also set it on globalThis so `new SpeechSynthesisUtterance` works in hook code
;(globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: mockGetVoices,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    },
    writable: true,
    configurable: true,
  })
})

describe('useSpeech', () => {
  it('detects support when speechSynthesis exists', () => {
    const { result } = renderHook(() => useSpeech())
    expect(result.current.isSupported).toBe(true)
  })

  it('starts with isSpeaking false and no speakingMessageId', () => {
    const { result } = renderHook(() => useSpeech())
    expect(result.current.isSpeaking).toBe(false)
    expect(result.current.speakingMessageId).toBeNull()
  })

  it('calls speechSynthesis.speak with correct voice settings', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.speak('Olá Jarvis', 'msg-1') })
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance
    expect(utterance.text).toBe('Olá Jarvis')
    expect(utterance.pitch).toBe(1.0)
    expect(utterance.rate).toBe(0.9)
    expect(utterance.lang).toBe('pt-BR')
  })

  it('calls speechSynthesis.cancel when stop() is called', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.stop() })
    expect(mockCancel).toHaveBeenCalledTimes(1)
  })

  it('cancels previous speech before starting a new one', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => { result.current.speak('primeira', 'msg-1') })
    act(() => { result.current.speak('segunda', 'msg-2') })
    // Each speak() call invokes cancel() first
    expect(mockCancel).toHaveBeenCalledTimes(2)
  })

  it('isSupported is false when speechSynthesis is absent', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useSpeech())
    expect(result.current.isSupported).toBe(false)
  })
})
