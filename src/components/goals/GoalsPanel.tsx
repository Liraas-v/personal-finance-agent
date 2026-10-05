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
import { limitStatus } from '@/lib/limits'
import { cn } from '@/lib/utils'

const configRepository = getConfigRepository()

export function GoalsPanel() {
  const { config, setConfig } = useFinanceStore(useShallow((s) => ({
    config: s.config,
    setConfig: s.setConfig,
  })))
  const { saldo, porCategoria } = useTransactions()
  const moeda = config?.moeda ?? 'BRL'

  // Rascunho da meta: null = não está editando. O valor inicial é lido do config no momento do clique,
  // então não importa quando o config (assíncrono) chegou.
  const [metaDraft, setMetaDraft] = useState<string | null>(null)
  const editingMeta = metaDraft !== null
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [catLimit, setCatLimit] = useState('')
  const [saving, setSaving] = useState(false)

  const saveMeta = async () => {
    if (!config || metaDraft === null) return
    const v = parseFloat(metaDraft)
    if (isNaN(v)) return
    setSaving(true)
    try {
      const updated = await configRepository.update({ metaEconomia: v })
      setConfig(updated)
      toast.success('Meta de economia atualizada')
      setMetaDraft(null)
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
  const metaPct = metaEconomia > 0 ? Math.max(0, (saldo / metaEconomia) * 100) : 0
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
            onClick={() => setMetaDraft(editingMeta ? null : String(config?.metaEconomia ?? 0))}
            className="text-xs text-muted-foreground h-7"
          >
            Editar
          </Button>
        </div>

        {editingMeta && (
          <div className="flex gap-2 mb-4">
            <Input
              value={metaDraft ?? ''}
              onChange={(e) => setMetaDraft(e.target.value)}
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
            <span>Economizado: <span className="font-mono tabular-nums">{fmt(Math.max(0, saldo))}</span></span>
            <span>Meta: <span className="font-mono tabular-nums">{fmt(metaEconomia)}</span></span>
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
        <ul className="space-y-3">
          {ALL_CATEGORIES.filter((c) => c !== 'Outros').map((cat, i) => {
            const spent = porCategoria[cat] ?? 0
            const limit = limits[cat] ?? 0
            const { status, pct } = limitStatus(spent, limit)
            const tone =
              status === 'over' ? 'text-negative' : status === 'warning' ? 'text-warning' : 'text-foreground-secondary'

            return (
              <motion.li
                key={cat}
                data-categoria={cat}
                data-status={status}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'rounded-lg border px-3 py-2',
                  status === 'over'
                    ? 'border-negative/40 bg-negative/5'
                    : status === 'warning'
                    ? 'border-warning/30 bg-warning/5'
                    : 'border-border'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-sm ${tone}`}>{cat}</span>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs tabular-nums ${status === 'none' ? 'text-muted-foreground' : tone}`}>
                      {fmt(spent)}{limit > 0 ? ` / ${fmt(limit)}` : ''}
                    </span>
                    {editingCat === cat ? (
                      <div className="flex gap-1">
                        <Input
                          value={catLimit}
                          onChange={(e) => setCatLimit(e.target.value)}
                          placeholder="Limite"
                          aria-label={`Limite de ${cat}`}
                          className="h-7 w-24 border-border-strong bg-muted text-xs"
                        />
                        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => saveCatLimit(cat)} disabled={saving}>
                          OK
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingCat(cat); setCatLimit(limit > 0 ? String(limit) : '') }}
                        aria-label={limit > 0 ? `Editar limite de ${cat}` : `Definir limite de ${cat}`}
                        className="rounded-md border border-border-strong px-2 py-1 text-xs text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {limit > 0 ? 'Editar' : 'Definir limite'}
                      </button>
                    )}
                  </div>
                </div>
                {status !== 'none' && (
                  <Progress
                    value={pct}
                    className={`mt-2 h-1.5 ${
                      status === 'over' ? '[&>div]:bg-negative' : status === 'warning' ? '[&>div]:bg-warning' : '[&>div]:bg-primary'
                    }`}
                  />
                )}
              </motion.li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
