// hooks/useVoice.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from 'react'

interface UseVoiceOptions {
  onResult: (transcript: string) => void
  onInterimResult?: (transcript: string) => void
}

export function useVoice({ onResult, onInterimResult }: UseVoiceOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Detecção de capacidade só pode rodar no cliente; fazer isso no render causaria erro de hidratação
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }, [])
  const recognitionRef = useRef<any>(null)

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    if (!isSupported) return

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const recognition: any = new SR()

    recognition.lang = 'pt-BR'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript

      if (result.isFinal) {
        onResult(transcript.trim())
        stop()
      } else {
        onInterimResult?.(transcript.trim())
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isSupported, onResult, onInterimResult, stop])

  const toggle = useCallback(() => {
    if (isListening) stop()
    else start()
  }, [isListening, start, stop])

  return { isListening, isSupported, start, stop, toggle }
}
