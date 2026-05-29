'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, BarChart2, Mic, MicOff } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useSpeech } from '@/hooks/useSpeech'
import { useVoice } from '@/hooks/useVoice'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ChatPanel() {
  const { messages, loading, contextEnabled, toggleContext, sendMessage, clearChat } = useChat()
  const { speak, stop, speakingMessageId, isSupported: ttsSupported } = useSpeech()
  const [input, setInput] = useState('')
  const [jarvisEnabled, setJarvisEnabled] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-speak new assistant messages when Jarvis mode is on
  useEffect(() => {
    if (!jarvisEnabled || messages.length <= prevLengthRef.current) {
      prevLengthRef.current = messages.length
      return
    }
    prevLengthRef.current = messages.length
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant') speak(last.content, last.id)
  }, [messages, jarvisEnabled, speak])

  // Stop speech when Jarvis is turned off
  useEffect(() => {
    if (!jarvisEnabled) stop()
  }, [jarvisEnabled, stop])

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop])

  const { isListening, isSupported: sttSupported, toggle: toggleMic } = useVoice({
    onResult: (transcript) => {
      setInput('')
      sendMessage(transcript)
    },
    onInterimResult: (t) => setInput(t),
  })

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <button
          onClick={toggleContext}
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors',
            contextEnabled
              ? 'border-violet-700 bg-violet-950 text-violet-300'
              : 'border-[#2a2a3e] bg-transparent text-slate-500'
          )}
        >
          <BarChart2 size={11} />
          Contexto financeiro: {contextEnabled ? 'ON' : 'OFF'}
        </button>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-slate-600 hover:text-slate-400 transition-colors p-1"
            title="Limpar chat"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2 py-16">
            <p className="text-sm">Olá! Como posso ajudar com suas finanças?</p>
            <p className="text-xs opacity-70">
              {contextEnabled
                ? 'Contexto financeiro ativo — vou analisar seus dados reais.'
                : 'Contexto desativado — respondendo de forma genérica.'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-[#1e1e2e] text-slate-200 rounded-tr-sm'
                  : 'bg-[#1a1040] border border-violet-900/40 text-violet-100 rounded-tl-sm'
              )}
            >
              {msg.content}

              {/* Waveform indicator — shown only on the message currently being spoken */}
              {msg.role === 'assistant' && speakingMessageId === msg.id && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-[2px] items-center h-[14px]">
                    {([6, 10, 14, 10, 6] as const).map((h, i) => (
                      <span
                        key={i}
                        className="w-[2px] bg-violet-500 rounded-sm"
                        style={{
                          height: `${h}px`,
                          animation: 'waveBar 0.8s ease infinite',
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-violet-400">falando...</span>
                  <button
                    onClick={stop}
                    className="ml-auto text-[10px] text-violet-400 border border-violet-900/60 rounded px-1.5 py-0.5 hover:text-violet-200 transition-colors"
                  >
                    ■ parar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1040] border border-violet-900/40 px-4 py-3 rounded-xl rounded-tl-sm">
              <span className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="flex gap-2 shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? 'Ouvindo...'
              : 'Pergunte algo sobre suas finanças... (Enter para enviar)'
          }
          rows={2}
          className="flex-1 resize-none bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-700 transition-colors"
        />
        {sttSupported && (
          <button
            onClick={toggleMic}
            title={isListening ? 'Parar gravação' : 'Falar pergunta'}
            className={cn(
              'self-end w-10 h-10 rounded-xl flex items-center justify-center border transition-colors',
              isListening
                ? 'bg-red-500/20 border-red-500/60 text-red-400'
                : 'bg-[#1e1e2e] border-[#2a2a3e] text-slate-500 hover:text-slate-300'
            )}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}
        <Button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-violet-700 hover:bg-violet-600 self-end"
          size="icon"
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Jarvis mode toggle */}
      {ttsSupported && (
        <div className="mt-3 shrink-0">
          <button
            onClick={() => setJarvisEnabled((v) => !v)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs transition-colors',
              jarvisEnabled
                ? 'bg-[#1a1040] border-violet-700 text-violet-300'
                : 'bg-transparent border-[#2a2a3e] text-slate-600 hover:text-slate-400'
            )}
          >
            <span className="flex items-center gap-2">
              🔊
              <span>Modo Jarvis — responde e fala automaticamente</span>
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-medium',
                jarvisEnabled ? 'bg-violet-700 text-white' : 'bg-[#2a2a3e] text-slate-500'
              )}
            >
              {jarvisEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
