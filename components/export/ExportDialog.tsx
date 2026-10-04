'use client'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { useFinanceStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { exportCSV, exportPDF } from '@/lib/exportUtils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Transaction } from '@/types'

type PeriodoOption = 'atual' | 'mes' | 'tudo'

function getFilename(base: string, ext: string) {
  const d = new Date()
  const mes = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  return `${base}-${mes.replace(' de ', '-').replace(' ', '-')}.${ext}`
}

function filterByPeriodo(
  transactions: Transaction[],
  periodo: PeriodoOption,
  dateRange: { from: string; to: string } | null
): { filtered: Transaction[]; label: string } {
  if (periodo === 'tudo') {
    return { filtered: transactions, label: 'Histórico completo' }
  }
  if (periodo === 'mes') {
    const now = new Date()
    const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return {
      filtered: transactions.filter((t) => t.data.startsWith(mes)),
      label: now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
    }
  }
  // 'atual' — usa dateRange do store
  if (!dateRange) return { filtered: transactions, label: 'Todos os períodos' }
  return {
    filtered: transactions.filter((t) => t.data >= dateRange.from && t.data <= dateRange.to),
    label: `${dateRange.from} → ${dateRange.to}`,
  }
}

export function ExportDialog() {
  const [open, setOpen] = useState(false)
  const [periodo, setPeriodo] = useState<PeriodoOption>('mes')
  const [loading, setLoading] = useState<'csv' | 'pdf' | null>(null)

  const { transactions, dateRange, moeda } = useFinanceStore(
    useShallow((s) => ({ transactions: s.transactions, dateRange: s.dateRange, moeda: s.config?.moeda ?? 'BRL' }))
  )

  async function handleExport(format: 'csv' | 'pdf') {
    setLoading(format)
    const { filtered, label } = filterByPeriodo(transactions, periodo, dateRange)

    if (filtered.length === 0) {
      toast.warning('Nenhuma transação neste período')
      setLoading(null)
      return
    }

    try {
      if (format === 'csv') {
        exportCSV(filtered, getFilename('finance-agent', 'csv'))
      } else {
        await exportPDF(filtered, label, getFilename('finance-agent', 'pdf'), moeda)
      }
      toast.success(`Exportado com sucesso (${filtered.length} transações)`)
      setOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao exportar')
    } finally {
      setLoading(null)
    }
  }

  const OPCOES: { value: PeriodoOption; label: string; sub: string }[] = [
    { value: 'atual', label: 'Período atual', sub: dateRange ? `${dateRange.from} → ${dateRange.to}` : 'Todos os períodos' },
    { value: 'mes', label: 'Mês atual', sub: new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) },
    { value: 'tudo', label: 'Histórico completo', sub: `${transactions.length} transações` },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-muted border-border-strong text-foreground-secondary hover:text-foreground text-xs">
          <Download size={13} />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Exportar dados</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Período</p>
          {OPCOES.map((op) => (
            <button
              key={op.value}
              onClick={() => setPeriodo(op.value)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                periodo === op.value
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-border hover:border-border-strong hover:bg-muted'
              }`}
            >
              <p className={`text-sm font-medium ${periodo === op.value ? 'text-primary' : 'text-foreground'}`}>
                {op.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{op.sub}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 gap-1.5 text-xs"
            variant="outline"
            disabled={loading !== null}
            onClick={() => handleExport('csv')}
          >
            {loading === 'csv' ? '...' : '⬇ CSV'}
          </Button>
          <Button
            className="flex-1 gap-1.5 text-xs"
            disabled={loading !== null}
            onClick={() => handleExport('pdf')}
          >
            {loading === 'pdf' ? '...' : '⬇ PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
