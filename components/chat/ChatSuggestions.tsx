'use client'

export const CHAT_SUGGESTIONS = [
  'Quanto gastei com alimentação este mês?',
  'Qual foi minha maior despesa?',
  'Estou dentro dos meus limites por categoria?',
  'Onde posso economizar?',
]

export function ChatSuggestions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {CHAT_SUGGESTIONS.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground"
        >
          {text}
        </button>
      ))}
    </div>
  )
}
