'use client'
import { useSyncExternalStore } from 'react'
import { Wifi } from 'lucide-react'
import { useOllamaStatus } from '@/hooks/useOllamaStatus'

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

type DotColor = 'green' | 'amber' | 'red'

function Dot({ color }: { color: DotColor }) {
  const cls: Record<DotColor, string> = {
    green: 'bg-positive',
    amber: 'bg-warning',
    red: 'bg-negative',
  }
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cls[color]}`} />
}

const subscribe = () => () => {}
const hasSpeech = () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
// servidor e hidratação: false; depois da montagem: valor real do navegador
const useSpeechAvailable = () => useSyncExternalStore(subscribe, hasSpeech, () => false)

export function StatusSection() {
  const { status, loading } = useOllamaStatus()
  const speechAvailable = useSpeechAvailable()

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
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Wifi size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">Status do Sistema</h3>
      </div>

      <div className="space-y-2">
        {rows.map(({ label, color, detail }) => (
          <div
            key={label}
            className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5"
          >
            <Dot color={color} />
            <span className="text-sm text-foreground-secondary flex-1">{label}</span>
            <span className="text-xs text-muted-foreground text-right">{detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
