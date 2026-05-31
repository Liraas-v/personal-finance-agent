'use client'
import { useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'
import { useVoice } from '@/hooks/useVoice'
import { useTransactions } from '@/hooks/useTransactions'
import { parseVoiceInput } from '@/lib/parser'
import { categorizeByKeyword } from '@/lib/categories'

export function VoiceRecorder() {
  const [interim, setInterim] = useState('')
  const [showTranscript, setShowTranscript] = useState(false)
  const { create } = useTransactions()

  const handleResult = async (transcript: string) => {
    setInterim('')
    setShowTranscript(false)

    const parsed = parseVoiceInput(transcript)
    if (!parsed) {
      toast.error(`Não entendi: "${transcript}"`)
      return
    }

    // Categorize: keyword first, Ollama fallback
    let categoria = categorizeByKeyword(parsed.descricao)
    if (categoria === 'Outros') {
      try {
        const res = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcript }),
        })
        const data = await res.json()
        if (data.categoria) categoria = data.categoria
      } catch {
        // Ollama offline — keep 'Outros'
      }
    }

    await create({
      tipo: parsed.tipo,
      descricao: parsed.descricao,
      valor: parsed.valor,
      categoria,
      pagamento: parsed.pagamento,
      ...(parsed.parcelas ? { parcelas: parsed.parcelas } : {}),
      data: new Date().toISOString().split('T')[0],
      origem: 'voz',
    })
  }

  const { isListening, isSupported, toggle } = useVoice({
    onResult: handleResult,
    onInterimResult: (t) => {
      setInterim(t)
      setShowTranscript(true)
    },
  })

  const pathname = usePathname()

  if (!isSupported || pathname === '/chat') return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTranscript && interim && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-[#0f0f17] border border-[#1e1e2e] rounded-xl px-4 py-2 max-w-xs text-sm text-slate-300 shadow-2xl"
          >
            <p className="text-xs text-violet-400 mb-1">Ouvindo...</p>
            <p>{interim}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Pulse rings while recording */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-violet-600"
              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-violet-600"
              animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}

        <motion.button
          onClick={toggle}
          whileTap={{ scale: 0.92 }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
            isListening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500'
          }`}
          style={{
            boxShadow: isListening
              ? '0 0 30px rgba(239,68,68,0.5)'
              : '0 0 30px rgba(124,58,237,0.4)',
          }}
        >
          {isListening ? (
            <MicOff size={22} className="text-white" />
          ) : (
            <Mic size={22} className="text-white" />
          )}
        </motion.button>
      </div>
    </div>
  )
}
