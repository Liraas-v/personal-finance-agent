'use client'
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'

const OPTIONS = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const

// false no servidor e na hidratação, true depois: evita marcar uma opção antes de o tema real ser conhecido
const subscribe = () => () => {}
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false)

export function ThemeSelect({ showLabels = false }: { showLabels?: boolean }) {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <div role="group" aria-label="Tema" className="inline-flex rounded-md border border-border bg-muted p-0.5">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={`inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs transition-colors ${
              active ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={14} />
            {showLabels && <span>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}
