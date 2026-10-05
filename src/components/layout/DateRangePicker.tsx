'use client'
import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { useFinanceStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Preset = { label: string; from: string; to: string }

function getPresets(): Preset[] {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const minus7 = new Date(now); minus7.setDate(minus7.getDate() - 7)
  const minus30 = new Date(now); minus30.setDate(minus30.getDate() - 30)
  const firstOfYear = new Date(now.getFullYear(), 0, 1)

  return [
    { label: 'Este mês', from: fmt(firstOfMonth), to: fmt(lastOfMonth) },
    { label: 'Últimos 7 dias', from: fmt(minus7), to: fmt(now) },
    { label: 'Últimos 30 dias', from: fmt(minus30), to: fmt(now) },
    { label: 'Este ano', from: fmt(firstOfYear), to: fmt(now) },
  ]
}

export function DateRangePicker() {
  const { dateRange, setDateRange } = useFinanceStore(useShallow((s) => ({
    dateRange: s.dateRange,
    setDateRange: s.setDateRange,
  })))
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const presets = getPresets()

  const label = dateRange
    ? `${dateRange.from} → ${dateRange.to}`
    : 'Todos os períodos'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 bg-muted border-border-strong text-foreground-secondary hover:text-foreground text-xs"
        >
          <Calendar size={12} />
          {label}
          <ChevronDown size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 bg-card border-border p-3"
        align="end"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Período</p>
        <div className="flex flex-col gap-1 mb-3">
          <button
            onClick={() => { setDateRange(null); setOpen(false) }}
            className="text-left text-xs px-2 py-1.5 rounded hover:bg-muted text-foreground-secondary"
          >
            Todos os períodos
          </button>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => { setDateRange({ from: p.from, to: p.to }); setOpen(false) }}
              className="text-left text-xs px-2 py-1.5 rounded hover:bg-muted text-foreground-secondary"
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Personalizado</p>
        <div className="flex flex-col gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="text-xs bg-muted border border-border-strong rounded px-2 py-1 text-foreground-secondary"
          />
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="text-xs bg-muted border border-border-strong rounded px-2 py-1 text-foreground-secondary"
          />
          <Button
            size="sm"
            className="text-xs h-7"
            disabled={!customFrom || !customTo}
            onClick={() => {
              setDateRange({ from: customFrom, to: customTo })
              setOpen(false)
            }}
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
