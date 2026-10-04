'use client'
import { useState } from 'react'
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useFinanceStore } from '@/lib/store'
import { getConfigRepository } from '@/lib/repositories'
import { useShallow } from 'zustand/react/shallow'
import { useTransactions } from '@/hooks/useTransactions'
import { ALL_CATEGORIES } from '@/lib/categories'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

const configRepository = getConfigRepository()

export function GoalsPanel() {
  const { config, setConfig } = useFinanceStore(useShallow((s) => ({
    config: s.config,
    setConfig: s.setConfig,
  })))
  const { saldo, porCategoria } = useTransactions()
  const moeda = config?.moeda ?? 'BRL'

  const [editingMeta, setEditingMeta] = useState(false)
  const [metaValue, setMetaValue] = useState(config?.metaEconomia?.toString() ?? '0')
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [catLimit, setCatLimit] = useState('')
  const [saving, setSaving] = useState(false)

  const saveMeta = async () => {
    if (!config) return
    const v = parseFloat(metaValue)
    if (isNaN(v)) return
    setSaving(true)
    try {
      const updated = await configRepository.update({ metaEconomia: v })
      setConfig(updated)
      toast.success('Meta de economia atualizada')
      setEditingMeta(false)
    } catch {
      toast.error('Erro ao salvar meta de economia')
    } finally {
      setSaving(false)
    }
  }

  const saveCatLimit = async (cat: string) => {
    if (!config) return
    const v = parseFloat(catLimit)
    if (isNaN(v)) return
    const limites = { ...(config.limitesPorCategoria ?? {}), [cat]: v }
    setSaving(true)
    try {
      const updated = await configRepository.update({ limitesPorCategoria: limites })
      setConfig(updated)
      toast.success(`Limite de ${cat} atualizado`)
      setEditingCat(null)
    } catch {
      toast.error(`Erro ao salvar limite de ${cat}`)
    } finally {
      setSaving(false)
    }
  }

  const metaEconomia = config?.metaEconomia ?? 0
  const metaPct = metaEconomia > 0 ? (saldo / metaEconomia) * 100 : 0
  const limits = config?.limitesPorCategoria ?? {}
  const fmt = (v: number) => formatCurrency(v, moeda)

  return (
    <div className="space-y-4 max-w-[900px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Meta de Economia Mensal</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingMeta(!editingMeta)}
            className="text-xs text-muted-foreground h-7"
          >
            Editar
          </Button>
        </div>

        {editingMeta && (
          <div className="flex gap-2 mb-4">
            <Input
              value={metaValue}
              onChange={(e) => setMetaValue(e.target.value)}
              placeholder="Ex: 2000"
              className="h-8 text-sm bg-muted border-border-strong text-foreground w-40"
            />
            <Button size="sm" className="h-8 text-xs" onClick={saveMeta} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Economizado: {fmt(Math.max(0, saldo))}</span>
            <span>Meta: {fmt(metaEconomia)}</span>
          </div>
          <Progress value={Math.max(0, Math.min(100, metaPct))} className="h-2" />
          <div className="flex items-center gap-1.5 text-xs">
            {metaPct >= 100 ? (
              <><CheckCircle2 size={12} className="text-positive" /><span className="text-positive">Meta atingida!</span></>
            ) : metaPct >= 70 ? (
              <><CheckCircle2 size={12} className="text-primary" /><span className="text-primary">{metaPct.toFixed(0)}% concluído</span></>
            ) : (
              <><AlertTriangle size={12} className="text-warning" /><span className="text-warning">{metaPct.toFixed(0)}% concluído</span></>
            )}
          </div>
        </div>
      </motion.div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Limites por Categoria</h3>
        <div className="space-y-4">
          {ALL_CATEGORIES.filter((c) => c !== 'Outros').map((cat, i) => {
            const spent = porCategoria[cat] ?? 0
            const limit = limits[cat] ?? 0
            const pct = limit > 0 ? (spent / limit) * 100 : 0
            const isOver = pct > 100
            const isWarn = pct > 80 && pct <= 100

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'rounded-lg transition-colors',
                  isOver && 'border border-negative/40 bg-negative/5 px-2 py-1',
                  isWarn && !isOver && 'border border-warning/30 bg-warning/5 px-2 py-1'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs ${isOver ? 'text-negative' : isWarn ? 'text-warning' : 'text-foreground-secondary'}`}>
                    {cat}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isOver ? 'text-negative' : isWarn ? 'text-warning' : 'text-muted-foreground'}`}>
                      {fmt(spent)}{limit > 0 ? ` / ${fmt(limit)}` : ''}
                    </span>
                    {editingCat === cat ? (
                      <div className="flex gap-1">
                        <Input
                          value={catLimit}
                          onChange={(e) => setCatLimit(e.target.value)}
                          placeholder="Limite"
                          className="h-6 text-xs bg-muted border-border-strong w-20 sm:w-24"
                        />
                        <Button
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => saveCatLimit(cat)}
                          disabled={saving}
                        >
                          OK
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingCat(cat); setCatLimit(limit?.toString() ?? '') }}
                        className="text-xs text-muted-foreground hover:text-foreground-secondary"
                      >
                        definir
                      </button>
                    )}
                  </div>
                </div>
                {limit > 0 && (
                  <Progress
                    value={Math.min(100, pct)}
                    className={`h-1.5 ${isOver ? '[&>div]:bg-negative' : isWarn ? '[&>div]:bg-warning' : '[&>div]:bg-primary'}`}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
