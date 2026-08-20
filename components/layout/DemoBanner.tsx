'use client'
import { Info } from 'lucide-react'

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

export function DemoBanner() {
  if (!isDemoMode) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-violet-950/60 border-b border-violet-800/40 px-2 sm:px-4 text-xs text-violet-200 flex items-center gap-1.5 sm:gap-2 justify-center text-center">
      <Info size={13} className="shrink-0" />
      <span data-testid="demo-banner-text" className="truncate">
        {/* Abaixo de sm: texto curto, para caber sem corte em telas de 320px */}
        <span className="sm:hidden">Demo — dados só no navegador.{' '}</span>
        {/* De sm a lg: versão média, já explicando o Ollama local */}
        <span className="hidden sm:inline lg:hidden">
          Demo — dados no navegador, IA via Groq. Localmente, Ollama 100% offline.{' '}
        </span>
        {/* lg pra cima: mensagem completa */}
        <span className="hidden lg:inline">
          Modo demo — dados salvos só no seu navegador, IA via Groq. Rodando localmente,
          o Finance Agent usa Ollama 100% offline.{' '}
        </span>
        <a
          href="https://github.com/Liraas-v/FINANCE-AGENT"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-violet-100"
        >
          Ver no GitHub
        </a>
      </span>
    </div>
  )
}
