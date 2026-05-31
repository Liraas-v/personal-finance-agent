'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

function sanitizeForTTS(text: string): string {
  return text
    .replace(/[*_#`]/g, '')
    .replace(/R\$\s*([\d.]+),([\d]{2})/g, (_, intPart, dec) => {
      const reais = intPart.replace(/\./g, '')
      const cents = parseInt(dec, 10)
      return cents === 0 ? `${reais} reais` : `${reais} reais e ${cents} centavos`
    })
    .replace(/R\$/g, 'reais')
}

interface UseSpeechReturn {
  speak: (text: string, messageId: string) => void
  stop: () => void
  isSpeaking: boolean
  speakingMessageId: string | null
  isSupported: boolean
}

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    // Detecção de capacidade só pode rodar no cliente; fazer isso no render causaria erro de hidratação
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(typeof window.speechSynthesis !== 'undefined')
  }, [])

  useEffect(() => {
    if (typeof window.speechSynthesis === 'undefined') return
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices() }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
    setSpeakingMessageId(null)
  }, [])

  const speak = useCallback((text: string, messageId: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(sanitizeForTTS(text))
    utterance.lang = 'pt-BR'
    utterance.pitch = 1.0
    utterance.rate = 0.9

    const ptVoice = voicesRef.current.find((v) => v.lang.startsWith('pt'))
    if (ptVoice) utterance.voice = ptVoice

    utterance.onstart = () => {
      setIsSpeaking(true)
      setSpeakingMessageId(messageId)
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      setSpeakingMessageId(null)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setSpeakingMessageId(null)
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  useEffect(() => () => { window.speechSynthesis?.cancel() }, [])

  return { speak, stop, isSpeaking, speakingMessageId, isSupported }
}
