'use client'
import { useState } from 'react'
import { Target } from 'lucide-react'
import { useFinanceStore } from '@/lib/store'
import { getConfigRepository } from '@/lib/repositories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Config } from '@/types'

const configRepository = getConfigRepository()

const MOEDAS: { value: Config['moeda']; label: string }[] = [
  { value: 'BRL', label: 'BRL — Real Brasileiro' },
  { value: 'USD', label: 'USD — Dólar Americano' },
  { value: 'EUR', label: 'EUR — Euro' },
]

function MetasForm({ config }: { config: Config }) {
  const updateConfig = useFinanceStore((s) => s.updateConfig)
  const [meta, setMeta] = useState(String(config.metaEconomia))
  const [moeda, setMoeda] = useState<Config['moeda']>(config.moeda)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const updated = await configRepository.update({ metaEconomia: Number(meta), moeda })
      updateConfig({ metaEconomia: updated.metaEconomia, moeda: updated.moeda })
      toast.success('Preferências salvas')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">Metas e Preferências</h3>
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground-secondary text-xs">Meta de economia mensal</Label>
        <Input
          type="number"
          min="0"
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          className="bg-muted border-border-strong text-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground-secondary text-xs">Moeda</Label>
        <Select value={moeda} onValueChange={(v) => setMoeda(v as Config['moeda'])}>
          <SelectTrigger className="bg-muted border-border-strong text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border-strong">
            {MOEDAS.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-foreground">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        size="sm"
        onClick={save}
        disabled={saving}
        className="w-full text-xs bg-primary hover:bg-primary/90"
      >
        {saving ? 'Salvando...' : 'Salvar preferências'}
      </Button>
    </div>
  )
}

// O config chega de forma assíncrona: o formulário só monta quando ele existe, para que os campos
// nasçam com o valor real (e não com 0).
export function MetasSection() {
  const config = useFinanceStore((s) => s.config)

  if (!config) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-card p-5" aria-busy="true">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="h-9 animate-pulse rounded bg-muted" />
        <div className="h-9 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return <MetasForm config={config} />
}
