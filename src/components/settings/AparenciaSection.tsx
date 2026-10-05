'use client'
import { Palette } from 'lucide-react'
import { ThemeSelect } from '@/components/layout/ThemeSelect'

export function AparenciaSection() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Palette size={16} className="text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Aparência</h3>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-foreground-secondary">Tema</p>
        <ThemeSelect showLabels />
      </div>
    </div>
  )
}
