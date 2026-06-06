'use client'
import { Wifi } from 'lucide-react'
import { useOllamaStatus } from '@/hooks/useOllamaStatus'

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

type DotColor = 'green' | 'amber' | 'red'

function Dot({ color }: { color: DotColor }) {
  const cls: Record<DotColor, string> = {
    green: 'bg-green-400',
    amber: 'bg-amber-400',
    red: 'bg-red-500',
  }
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cls[color]}`} />
}

export function StatusSection() {
  const { status, loading } = useOllamaStatus()
  const speechAvailable =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const iaLabel = isDemoMode ? 'IA (Groq)' : 'Ollama'
  const iaColor: DotColor = loading ? 'amber' : status.online ? 'green' : 'red'
  const iaDetail = loading
    ? 'Verificando...'
    : status.online
    ? `Online — ${status.model}`
    : isDemoMode
    ? 'Indisponível no momento'
    : 'Offline — execute: ollama serve'

  const rows: { label: string; color: DotColor; detail: string }[] = [
    { label: iaLabel, color: iaColor, detail: iaDetail },
    { label: 'API local', color: 'green', detail: 'OK' },
    {
      label: 'Voz (Web Speech)',
      color: speechAvailable ? 'green' : 'red',
      detail: speechAvailable ? 'Disponível' : 'Não suportado neste browser',
    },
  ]

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Wifi size={16} className="text-violet-400" />
        <h3 className="font-semibold text-slate-200">Status do Sistema</h3>
      </div>

      <div className="space-y-2">
        {rows.map(({ label, color, detail }) => (
          <div
            key={label}
            className="flex items-center gap-3 bg-[#1e1e2e] rounded-lg px-4 py-2.5"
          >
            <Dot color={color} />
            <span className="text-sm text-slate-300 flex-1">{label}</span>
            <span className="text-xs text-slate-500 text-right">{detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
