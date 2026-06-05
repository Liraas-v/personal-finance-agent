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

export function MetasSection() {
  const config = useFinanceStore((s) => s.config)
  const updateConfig = useFinanceStore((s) => s.updateConfig)
  const [meta, setMeta] = useState(String(config?.metaEconomia ?? 0))
  const [moeda, setMoeda] = useState<Config['moeda']>(config?.moeda ?? 'BRL')
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
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-violet-400" />
        <h3 className="font-semibold text-slate-200">Metas e Preferências</h3>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-400 text-xs">Meta de economia mensal</Label>
        <Input
          type="number"
          min="0"
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          className="bg-[#1e1e2e] border-[#2a2a3e] text-slate-200"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-400 text-xs">Moeda</Label>
        <Select value={moeda} onValueChange={(v) => setMoeda(v as Config['moeda'])}>
          <SelectTrigger className="bg-[#1e1e2e] border-[#2a2a3e] text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e2e] border-[#2a2a3e]">
            {MOEDAS.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-slate-200">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        size="sm"
        onClick={save}
        disabled={saving}
        className="w-full text-xs bg-violet-700 hover:bg-violet-600"
      >
        {saving ? 'Salvando...' : 'Salvar preferências'}
      </Button>
    </div>
  )
}
