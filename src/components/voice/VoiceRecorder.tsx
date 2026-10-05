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
import { getCategorias } from '@/lib/customCategories'
import { useFinanceStore } from '@/lib/store'
import { buildTransactionInputs } from '@/lib/voiceInputs'

export function VoiceRecorder() {
  const [interim, setInterim] = useState('')
  const [showTranscript, setShowTranscript] = useState(false)
  const { create, createMany } = useTransactions()

  const handleResult = async (transcript: string) => {
    setInterim('')
    setShowTranscript(false)

    const parsed = parseVoiceInput(transcript)
    if (!parsed) {
      toast.error(`Não entendi: "${transcript}"`)
      return
    }

    // Categorize: keyword first, Ollama fallback
    const categorias = getCategorias(useFinanceStore.getState().config)
    let categoria = categorizeByKeyword(parsed.descricao, categorias)
    if (categoria === 'Outros') {
      try {
        const res = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcript, categorias }),
        })
        const data = await res.json()
        if (data.categoria) categoria = data.categoria
      } catch {
        // Ollama offline — keep 'Outros'
      }
    }

    // "Nike 4500 em 12x" vira 12 parcelas mensais; os demais casos são um único lançamento.
    const lote = buildTransactionInputs(parsed, categoria, new Date().toISOString().split('T')[0], 'voz')
    if (lote.length > 1) await createMany(lote)
    else await create(lote[0])
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
            className="bg-card border border-border rounded-lg px-4 py-2 max-w-xs text-sm text-foreground-secondary shadow-md"
          >
            <p className="text-xs text-primary mb-1">Ouvindo...</p>
            <p>{interim}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Pulse rings while recording */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}

        <motion.button
          onClick={toggle}
          whileTap={{ scale: 0.92 }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isListening
              ? 'bg-negative hover:bg-negative/90'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isListening ? (
            <MicOff size={22} className="text-primary-foreground" />
          ) : (
            <Mic size={22} className="text-primary-foreground" />
          )}
        </motion.button>
      </div>
    </div>
  )
}
